import config from "./config";

// <nowiki>

var API = new mw.Api( {
	ajax: {
		headers: { 
			"Api-User-Agent": "XFDcloser/" + config.script.version + 
				" ( https://en.wikipedia.org/wiki/WP:XFDC )"
		}
	}
} );

API.editWithRetry = function(titles, getParams, transform, onEachSuccess, onEachFail) {
	var processPage = function(page, id, starttime) {
		var basetimestamp = page.revisions && page.revisions[0].timestamp;
		var simplifiedPage = {
			pageid: page.pageid,
			missing: page.missing === "",
			redirect: page.redirect === "",
			categories: page.categories,
			ns: page.ns,
			title: page.title,
			content: page.revisions && page.revisions[0].slots.main["*"]
		};
		return $.when( transform(simplifiedPage) )
			.then(function(editParams) {
				var query = $.extend( {
					action: "edit",
					title: page.title,
					// Protect against errors and conflicts
					assert: "user",
					basetimestamp: basetimestamp,
					starttimestamp: starttime
				}, editParams );
				var doEdit = function(isRetry) {
					return API.postWithToken("csrf", query)
						.then(
							function(data) {
								if (onEachSuccess) {
									onEachSuccess(data);
								}
								return data.edit;
							},
							function(code, error) {
								if (code === "http" && !isRetry) {
									return doEdit(true);
								} else if ( code === "editconflict" ) {
									return doGetQuery(page.title);
								}
								if (onEachFail) {
									onEachFail(code, error, page.title);
								}
								return $.Deferred().reject(code, error, page.title);
							}
						);
				};
				return doEdit();
			}, function(code, error) {
				if (onEachFail) {
					onEachFail(code, error, page.title);
				}
				return $.Deferred().reject(code, error, page.title);			
			});
	};
	
	var doGetQuery = function(titles, isRetry) {
		return API.get(
			$.extend(
				{
					"action": "query",
					"format": "json",
					"curtimestamp": 1,
					"titles": titles,
					"prop": "revisions|info",
					"rvprop": "content|timestamp",
					"rvslots": "main"					
				},
				getParams
			)
		).then(function(response) {
			var starttime = response.curtimestamp;
			
			// Get an array of promises of edits (which may either be resolved or rejected)
			var pages = $.map(response.query.pages, function(page, id) {
				return processPage(page, id, starttime);
			});
			
			// If only for one title, return that promise (which may either be resolved or rejected)
			if (!$.isArray(titles)) {
				return pages[0];
			}

			// Otherwise, convert the array of promises into a single promise, resolved if all were
			// resolved, or rejected with an array of errors of all that failed.
			return $.when.apply(
				null,
				// Force promises to resolve as an object with a `success` key, so that
				// $.when will wait for all of them to be resolved or rejected
				pages.map(function(page) {
					return page.then(
						() => ({success: true}),
						(code, error, title) => ({
							success: false, 
							code: code,
							error: error,
							title: title
						})
					); // end page.then
				}) // end page.map
			) // end $.when
				.then(function() {
					var args = Array.prototype.slice.call(arguments);
					var errors = args.filter(function(arg) {
						return !arg.success;
					});
					if (errors.length > 0) {
						return $.Deferred().reject("write", errors);
					}
					return true;
				});
		}, function(code, error) {
			if (!isRetry) {
				return doGetQuery(titles, true);
			}
			return $.Deferred().reject("read", code, error);
		});
	};
	return doGetQuery(titles);
};

export default API;
// </nowiki>