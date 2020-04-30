import Task from "../Components/Task";
// <nowiki>

function UpdateNomTemplatesTask(config, relistInfoPromise) {
	config = {
		label: `Updating link in nomination ${config.discussion.pages.length > 1 ? "templates" : "template"}`,
		...config
	};
	// Call parent constructor
	UpdateNomTemplatesTask.super.call( this, config );

	this.relistInfoPromise = relistInfoPromise;
}
OO.inheritClass( UpdateNomTemplatesTask, Task );

UpdateNomTemplatesTask.prototype.doTask = function() {
	const transform = (page, today) => {
		// Check there's a corresponding nominated page
		const pageObj = this.discussion.getPageByTitle(page.title, {"moduledocs": true});
		if ( !pageObj ) {
			return $.Deferred().reject("unexpectedTitle");
		}
		// Check corresponding page exists
		if ( page.missing ) {
			return $.Deferred().reject("doesNotExist");
		}
		let updatedWikitext;
		try {
			updatedWikitext = this.venue.updateNomTemplateAfterRelist(
				page.content,
				today,
				this.discussion.sectionHeader
			);
		} catch(e){
			return $.Deferred().reject("couldNotUpdate", e);
		}
		
		var noChangesToMake = updatedWikitext === page.content;
		if ( noChangesToMake ) {
			return $.Deferred().reject("nominationTemplateNotFound");
		}
		
		return {
			text: updatedWikitext,
			summary: `Updating ${this.venue.type.toUpperCase()} template: discussion was relisted ${this.appConfig.script.advert}`
		};
	};

	return this.relistInfoPromise.then(relistInfo => {
		const pageTitles = this.discussion.getPageTitles(null, {"moduledocs":true});
		this.setTotalSteps(pageTitles.length);
		return this.api.editWithRetry(
			pageTitles,
			null,
			page => transform(page, relistInfo.today),
			() => this.trackStep(),
			(code, error, title) => {
				const titleLink = extraJs.makeLink(title).get(0).outerHTML;
				switch(code) {
				case "unexpectedTitle":
					this.addError(
						`API query result included unexpected title ${titleLink}; this page will not be edited`
					);
					this.trackStep({failed: true});
					break;
				case "doesNotExist":
					this.addError(
						`${titleLink} does not exist, and will not be edited`
					);
					this.trackStep({failed: true});
					break;
				case "couldNotUpdate":
					this.addError(
						`Could not update ${titleLink}: ${error.message}`
					);
					this.trackStep({failed: true});
					break;
				default:
					this.addError(
						`Could not edit page ${titleLink}`,
						{code, error}
					);
					this.trackStep({failed: true});
				}
			}
		).catch( (errortype, code, error) => {
			if ( errortype === "read" ) {
				this.addError(code, error, 
					`Could not read contents of nominated ${pageTitles.length > 1 ? "pages" : "page"}`
				);
				return "Failed";
			}
			// Other errors already handled above, just need to determine task status
			return (this.steps.completed === 0) ? "Failed" : "Done with errors";
		} );
	});
};

export default UpdateNomTemplatesTask;
// </nowiki>