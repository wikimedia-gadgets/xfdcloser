import Task from "../Components/Task";
import { rejection } from "../util";
// <nowiki>

function GetRelistInfoTask(config, relistComment) {
	config = {
		label: "Preparing to relist",
		...config
	};
	// Call parent constructor
	GetRelistInfoTask.super.call( this, config );
	this.relistComment = relistComment;

	this.relistInfo = $.Deferred();

	// temp logging of relistInfo
	this.relistInfo.then(ri => console.log("relistInfo", ri));
}
OO.inheritClass( GetRelistInfoTask, Task );

GetRelistInfoTask.prototype.doTask = function() {
	this.setTotalSteps(1);

	const now = new Date();
	const today = `${now.getUTCFullYear()} ${this.appConfig.monthNames[now.getUTCMonth()]} ${now.getUTCDate()}`;
	const todaysLogpage = this.venue.path + today;

	const queryBase = {
		action: "query",
		titles: this.discussion.nomPage,
		prop: "revisions",
		indexpageids: 1,
		rvprop: "content|timestamp",
		rvslots: "main",
		curtimestamp: 1,
		formatversion: "2"
	};
	const query = this.venue.type === "afd"
		? {	...queryBase,
			list: "embeddedin",
			eititle: this.discussion.nomPage,
			einamespace: this.venue.ns_logpages,
			eifilterredir: "nonredirects",
			eilimit: 500
		}
		: { ...queryBase, rvsection: this.discussion.sectionNumber };
	
	return this.api.get(query).then(response => {
		if (this.aborted) return rejection("Aborted");

		const content = response.query.pages[0].revisions[0].slots.main.content;
		const nomPageTimestamps = {
			start: response.curtimestamp,
			base: response.query.pages[0].revisions[0].timestamp
		};
		const heading =  content.slice(0, content.indexOf("\n"));
		// Abort if discussion is already closed
		if ( content.includes("xfd-closed") ) {
			return rejection(
				"abort", null,
				"Discussion has already been closed"
			);
		}
		
		// Relist template
		const relists = content.match(
			/\[\[Wikipedia:Deletion process#Relisting discussions\|Relisted\]\]/g
		);
		const relistNumber = relists ? relists.length + 1 : 1;
		const relistTemplate = `\n{{subst:Relist|1=${this.relistComment}|2=${relistNumber}}}\n`;

		// New/relisted discussion
		let newWikitext = content.trim() + relistTemplate;

		// Wikitext for old log page
		let oldLogWikitext = "";
		switch(this.venue.type) {
		case "afd":
			// Update link to log page
			newWikitext = newWikitext.replace(
				/\[\[Wikipedia:Articles for deletion\/Log\/\d{4} \w+ \d{1,2}#/,
				"[[" + todaysLogpage + "#"
			);
			break;
		case "ffd":
		case "tfd": {
			// Discussion on old log page gets closed
			const xfdCloseTop = this.venue.wikitext.closeTop
				.replace(/__RESULT__/, "relisted")
				.replace(/__TO_TARGET__/, ` on [[${todaysLogpage}#${this.discussion.sectionHeader}|${today}]]`)
				.replace(/__RATIONALE__/, ".")
				.replace(/__SIG__/, this.appConfig.user.sig);
			// List of nominated pages
			const pagesList = this.discussion.isBasicMode()
				? ""
				: this.discussion.pages.map(
					page => this.venue.wikitext.pagelinks.replace(
						"__PAGE__",
						page.getMain() + (page.getNamespaceId() === 828 ? "|module=Module" : "")
					)
				).join("");
			oldLogWikitext = `${heading}\n${xfdCloseTop}\n${pagesList + this.venue.wikitext.closeBottom}`;
			break;
		}
		case "mfd": {
			// Find first linebreak after last pagelinks template
			const splitIndex = newWikitext.indexOf("\n", newWikitext.lastIndexOf(":{{pagelinks"));
			// Add time stamp for bot to properly relist
			newWikitext = `${newWikitext.slice(0, splitIndex).trim()}\n{{subst:mfdr}}\n${newWikitext.slice(splitIndex+1).trim()}`;
			break;
		}
		case "rfd": {
			let topWikitext = `====${this.discussion.sectionHeader}====`;
			const firstNomIndex = content.indexOf("*<span id=");
			const lastNomIndex = content.lastIndexOf("*<span id=");
			if ( firstNomIndex !== lastNomIndex ) {
				// Multiple redirects were nominted, so keep nominated redirects' anchors
				// Find linebreak prior to first span with an id
				const sliceFrom = content.indexOf("\n", firstNomIndex-2);
				// Find linebreak after the last span with an id
				const sliceTo = content.indexOf("\n", lastNomIndex);
				const rfdAnchors = content.slice(sliceFrom, sliceTo)
					.replace(/\*<span/g, "<span") // remove bullets
					.replace(/^(?!<span).*$\n?/gm, "") // remove lines which don't start with a span
					.replace(/>.*$\s*/gm, "></span>") // remove content within or after span
					.trim();
				topWikitext += "\n<noinclude>" + rfdAnchors + "</noinclude>";
			}
			oldLogWikitext = `${topWikitext}\n{{subst:rfd relisted|page=${today}|${this.discussion.sectionHeader}}}`;
			break;
		}
		case "cfd":
			oldLogWikitext = `====${this.discussion.sectionHeader}====\n{{subst:cfd relisted|${this.discussion.sectionHeader}}}`;
		}

		const baseRelistInfo = { today, newWikitext, oldLogWikitext, nomPageTimestamps };

		switch (this.venue.type) {
		case "ffd":
		case "mfd":
			// New discussions are added to the bottom of the log page
			this.relistInfo.resolve({ ...baseRelistInfo, newLogEditType: "appendtext" });
			return;
		case "tfd":
		case "rfd":
		case "cfd":
			// New discussions go on top of the log page, so need to check out current log page wikitext
			return this.api.get({
				action: "query",
				titles: todaysLogpage,
				prop: "revisions",
				rvprop: "content|timestamp",
				rvslots: "main",
				curtimestamp: 1,
				formatversion: "2"
			}).then(response => {
				const page = response.query.pages[0];
				const newLogTimestamps = {
					start: response.curtimestamp,
					base: page.revisions[0].timestamp
				};
				const logWikitext = page.revisions[0].slots.main.content;
				const h4_match = /====\s*(.*?)\s*====/.exec(logWikitext);
				const h4 = h4_match && h4_match[1];
				if ( h4 ) {
					// There is at least 1 level 4 heading on page - can edit section #2
					this.relistInfo.resolve({
						...baseRelistInfo,
						newLogTimestamps,
						newLogSection: 2,
						newLogEditType: h4.toUpperCase() === "NEW NOMINATIONS"
							? "appendtext"
							: "prependtext"
					});
				} else {
					// There are no level 4 headings on page - can append to section #1
					this.relistInfo.resolve({
						...baseRelistInfo,
						newLogTimestamps,
						newLogSection: 1,
						newLogEditType: "appendtext"
					});
				}
			});
		case "afd": {
			// Check log page(s) where nom page is transcluded
			const logpages = response.query.embeddedin.filter(ei => ei.title.includes(this.venue.path));
			if ( logpages.length === 0 ) {
				return $.Deferred().reject(
					"abort", null,
					"Old log page not found"
				);
			} else if ( logpages.length > 1 ) {
				logpages.slice(1).forEach(logpage => {
					const logpageLink = extraJs.makeLink(
						logpage.title, logpage.title.replace(this.venue.path, "")
					).get(0).outerHTML;
					this.addWarning(
						`Note: transcluded on additional log page: ${logpageLink}`
					);
				});
			}

			const oldLogpage = logpages[0];
			// Abort if old log page is actually today's logpage
			if ( oldLogpage.title === todaysLogpage ) {
				return $.Deferred().reject(
					"abort", null,
					"Already transcluded to today's log page"
				);
			}
			
			const oldlogtitle = oldLogpage.title;

			// Get logpages' wikitext
			return this.api.get({
				action: "query",
				titles: [oldlogtitle, todaysLogpage],
				prop: "revisions",
				rvprop: "content|timestamp",
				rvslots: "main",
				curtimestamp: 1,
				formatversion: "2"
			}).then(response => {
				if ( response.query.pages.length === 1 ) {
					return $.Deferred().reject(
						"abort", null,
						"Already transcluded to today's log page"
					);
				}
				const newLogpage = response.query.pages[0].title === todaysLogpage
					? response.query.pages[0]
					: response.query.pages[1];
				const oldLogpage = response.query.pages[0].title === todaysLogpage
					? response.query.pages[1]
					: response.query.pages[0];

				const newLogContent = newLogpage.revisions[0].slots.main.content;
				const oldLogContent = oldLogpage.revisions[0].slots.main.content;
				const newLogTimestamps = {
					start: response.curtimestamp,
					base: newLogpage.revisions[0].timestamp
				};
				const oldLogTimestamps = {
					start: response.curtimestamp,
					base: oldLogpage.revisions[0].timestamp
				};

				// Check if already relisted
				const escapedTitle = mw.util.escapeRegExp(this.discussion.nomPage);
				const hiddenOnOldLogpage = new RegExp("<!-- ?\\{\\{" + escapedTitle + "\\}\\} ?-->", "i");
				const listedOnNewLogpage = new RegExp("\\{\\{" + escapedTitle + "\\}\\}", "i");
				if ( hiddenOnOldLogpage.test(oldLogContent) || listedOnNewLogpage.test(newLogContent) ) {
					return $.Deferred().reject(
						"abort", null,
						"Discussion has been relisted already"
					);
				}

				// Updated new log wikitext:
				const listCommentPattern = new RegExp("<!-- Add new entries to the TOP of the following list -->","i");
				const newLogWikitext = newLogContent.replace(
					listCommentPattern,
					"<!-- Add new entries to the TOP of the following list -->\n{{" +
					this.discussion.nomPage + "}}<!--Relisted-->"
				);		
				
				// Updated old log wikitext:
				const transclusionPattern = new RegExp("(\\{\\{" + escapedTitle + "\\}\\})", "i" );
				const oldlogTransclusion = transclusionPattern.test(oldLogContent);
				const oldLogWikitext = oldLogContent.replace(transclusionPattern, "<!-- $1 -->");

				this.relistInfo.resolve({
					...baseRelistInfo,
					oldlogtitle,
					oldlogTransclusion,
					oldLogWikitext,
					oldLogTimestamps,
					newLogWikitext,
					newLogTimestamps,
					newLogSection: 1,
					newLogEditType: "text"
				});				
			});
		}
		default: 
			return rejection("abort", null, "Unknown XfD venue");
		}
	}).then(
		() => { this.trackStep(); },
		(code, error, abortReason) => {
			if (code === "abort") {
				this.addError(
					abortReason ? "Aborted: " + abortReason : "Aborted",
					{abort: true}
				);
			} else {
				this.addError(
					`Could not read content of page ${extraJs.makeLink(this.discussion.nomPage).get(0).outerHTML}; could not relist discussion`,
					{code, error, abort: true}
				);
			}
			return rejection();
		}
	);
};

export default GetRelistInfoTask;
// </nowiki>