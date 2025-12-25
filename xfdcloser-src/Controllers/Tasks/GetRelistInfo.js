import { $, mw } from "../../../globals";
import config from "../../config";
import TaskItemController from "../TaskItemController";
import { rejection, ymdDateString, makeLink } from "../../util";
// <nowiki>

export default class RelistInfo extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Preparing to relist");
	}
	static today = ymdDateString(new Date());

	get todaysLogpage() {
		return this.model.venue.path + RelistInfo.today;
	}

	get query() {
		const queryBase = {
			action: "query",
			titles: this.model.discussion.discussionPageName,
			prop: "revisions",
			indexpageids: 1,
			rvprop: "content|timestamp",
			rvslots: "main",
			curtimestamp: 1,
			formatversion: "2"
		};
		return this.model.venue.type === "afd"
			? {	...queryBase,
				list: "embeddedin",
				eititle: this.model.discussion.discussionPageName,
				einamespace: this.model.venue.ns_logpages,
				eifilterredir: "nonredirects",
				eilimit: 500
			}
			: { ...queryBase, rvsection: this.model.discussion.sectionNumber };
	}

	getRelistTemplate(content) {
		const relists = content.match(
			/\[\[Wikipedia:Deletion process#Relisting discussions\|Relisted\]\]/g
		);
		const relistNumber = relists ? relists.length + 1 : 1;
		return `{{subst:XfD relist|1=${this.model.result.getRelistComment()}|2=${relistNumber}}}`;	
	}

	/**
	 * @param {String} content Page content
	 * @returns {Object<string,string>} { newWikitext, oldLogWikitext } 
	 */
	getRelistWikitext(content) {
		const heading = content.slice(0, content.indexOf("\n"));
		// Wikitext for new/relisted discussion
		let newWikitext = content.trim() + `\n${this.getRelistTemplate(content)}\n`;
		// Wikitext for old log page
		let oldLogWikitext = "";

		switch ( this.model.venue.type ) {
		case "afd":
			// Update link to log page
			newWikitext = newWikitext.replace(
				/\[\[Wikipedia:Articles for deletion\/Log\/\d{4} \w+ \d{1,2}#/,
				"[[" + this.todaysLogpage + "#"
			);
			break;
		case "ffd":
		case "tfd": {
			// Discussion on old log page gets closed
			const xfdCloseTop = this.model.venue.wikitext.closeTop
				.replace(/__RESULT__/, "relisted")
				.replace(/__TO_TARGET__/, ` on [[${this.todaysLogpage}#${this.model.discussion.sectionHeader}|${RelistInfo.today}]]`)
				.replace(/__RATIONALE__/, ".")
				.replace(/__SIG__/, config.user.sig);
			// List of nominated pages
			const pagesList = this.model.discussion.pages.map(
				page => this.model.venue.wikitext.pagelinks.replace(
					"__PAGE__",
					page.getMain() + (page.getNamespaceId() === 828 ? "|module=Module" : "")
				)
			).join("");
			oldLogWikitext = `${heading}\n${xfdCloseTop}\n${pagesList + this.model.venue.wikitext.closeBottom}`;
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
			// Discussion on old log page is replaced with relist note
			let topWikitext = `====${this.model.discussion.sectionHeader}====`;
			// If multiple redirects were nominted, keep nominated redirects' anchors
			const firstNomIndex = content.indexOf("*<span id=");
			const lastNomIndex = content.lastIndexOf("*<span id=");
			if ( firstNomIndex !== lastNomIndex ) {
				// Find linebreak prior to first span with an id
				const sliceFrom = content.indexOf("\n", firstNomIndex-2);
				// Find linebreak after the last span with an id
				const sliceTo = content.indexOf("\n", lastNomIndex);
				const rfdAnchors = content
					.slice(sliceFrom, sliceTo)
					.replace(/\*<span/g, "<span") // remove bullets
					.replace(/^(?!<span).*$\n?/gm, "") // remove lines which don't start with a span
					.replace(/>.*$\s*/gm, "></span>") // remove content within or after span
					.trim();
				topWikitext += "\n<noinclude>" + rfdAnchors + "</noinclude>";
			}
			oldLogWikitext = `${topWikitext}\n{{subst:rfd relisted|page=${RelistInfo.today}|${this.model.discussion.sectionHeader}}}`;
			break;
		}
		case "cfd":
			// Discussion on old log page is replaced with relist note
			oldLogWikitext = `====${this.model.discussion.sectionHeader}====\n{{subst:cfd relisted|${this.model.discussion.sectionHeader}}}`;
		}
		return { newWikitext, oldLogWikitext };
	}

	getLogInfo(embeddedinLogpage) {
		switch ( this.model.venue.type ) {
		case "ffd":
		case "mfd":
			// New discussions are added to the bottom of the log page
			return { newLogEditType: "appendtext" };
		case "tfd":
		case "rfd":
		case "cfd":
			// New discussions go on top of the log page, so need to check out current log page wikitext
			return this.api.get({
				action: "query",
				titles: this.todaysLogpage,
				prop: "revisions",
				rvprop: "content|timestamp",
				rvslots: "main",
				curtimestamp: 1,
				formatversion: "2"
			}).then(response => this.getNewLogInfo(response.query.pages[0], response.curtimestamp));
		case "afd": {
			return this.api.get({
				action: "query",
				titles: [embeddedinLogpage.title, this.todaysLogpage],
				prop: "revisions",
				rvprop: "content|timestamp",
				rvslots: "main",
				curtimestamp: 1,
				formatversion: "2"
			}).then(response => this.getTranscludingLogsInfo(response.query.pages, response.curtimestamp));
		}
		default: 
			return rejection("abort", "Unknown XfD venue");
		}
	}

	getNewLogInfo(page, curtimestamp) {
		if (page.missing) {
			return rejection("abort", "Today's log page does not yet exist");
		}
		const newLogTimestamps = {
			start: curtimestamp,
			base: page.revisions[0].timestamp
		};
		const logWikitext = page.revisions[0].slots.main.content;
		// Check if there is at least 1 level 4 heading on page - if so,
		// can edit section #2
		const h4_match = /====\s*(.*?)\s*====/.exec(logWikitext);
		const h4 = h4_match && h4_match[1];
		return {
			newLogTimestamps,
			newLogSection: h4 ? 2 : 1,
			newLogEditType: (h4 && h4.toUpperCase() !== "NEW NOMINATIONS")
				? "prependtext"
				: "appendtext"
		};
	}

	/**
	 * 
	 * @param {Object[]} pages page objects for old and new log pages, from api 
	 * @param {*} curtimestamp current timestamp from api response
	 * @returns {Object<string,string|number|boolean|object<string,string>>} info for old and new log pages
	 */
	getTranscludingLogsInfo(pages, curtimestamp) {
		if ( pages.length === 1 ) {
			return rejection("abort", "Already transcluded to today's log page");
		}
		const [newLogpage, oldLogpage] = pages[0].title === this.todaysLogpage
			? pages
			: pages.slice().reverse();

		const newLogContent = newLogpage.revisions[0].slots.main.content;
		const oldLogContent = oldLogpage.revisions[0].slots.main.content;
		const newLogTimestamps = {
			start: curtimestamp,
			base: newLogpage.revisions[0].timestamp
		};
		const oldLogTimestamps = {
			start: curtimestamp,
			base: oldLogpage.revisions[0].timestamp
		};

		// Check if already relisted
		const escapedTitle = mw.util.escapeRegExp(this.model.discussion.discussionPageName);
		const hiddenOnOldLogpage = new RegExp("<!-- ?\\{\\{" + escapedTitle + "\\}\\} ?-->", "i");
		const listedOnNewLogpage = new RegExp("\\{\\{" + escapedTitle + "\\}\\}", "i");
		if ( hiddenOnOldLogpage.test(oldLogContent) || listedOnNewLogpage.test(newLogContent) ) {
			return rejection("abort", "Discussion has been relisted already");
		}

		// Updated new log wikitext:
		const listCommentPattern = new RegExp("<!-- Add new entries to the TOP of the following list -->","i");
		const newLogWikitext = newLogContent.replace(
			listCommentPattern,
			"<!-- Add new entries to the TOP of the following list -->\n{{" +
			this.model.discussion.discussionPageName + "}}<!--Relisted-->"
		);		
		
		// Updated old log wikitext:
		const transclusionPattern = new RegExp("(\\{\\{" + escapedTitle + "\\}\\})", "i" );
		const oldlogTransclusion = transclusionPattern.test(oldLogContent);
		const oldLogWikitext = oldLogContent.replace(transclusionPattern, "<!-- $1 -->");

		return {
			oldlogtitle: oldLogpage.title,
			oldlogTransclusion,
			oldLogWikitext,
			oldLogTimestamps,
			newLogWikitext,
			newLogTimestamps,
			newLogSection: 1,
			newLogEditType: "text"
		};				
	}

	getEmbeddedInLogpages(embeddedin) {
		return embeddedin.filter(ei => ei.title.includes(this.model.venue.path));
	}

	doTask() {
		this.model.setTotalSteps(1);

		this.model.setDoing();
		return this.api.get(this.query).then(response => {
			if ( this.model.aborted ) {
				return rejection("aborted");
			}
			const content = response.query.pages[0].revisions[0].slots.main.content;
			// Abort if discussion is already closed
			if ( content.includes("xfd-closed") ) {
				return rejection("abort", "Discussion is already closed");
			}

			const discussionPageTimestamps = {
				start: response.curtimestamp,
				base: response.query.pages[0].revisions[0].timestamp
			};
			const { newWikitext, oldLogWikitext } = this.getRelistWikitext(content);
			let embeddedinLogpage;
			if ( response.query.embeddedin ) {
				const embeddedInLogpages = response.query.embeddedin
					.filter(ei => ei.title.includes(this.model.venue.path));
				if ( embeddedInLogpages.length === 0 ) {
					return rejection("abort", "Old log page not found");
				} else if ( embeddedInLogpages.length > 1 ) {
					embeddedInLogpages.slice(1).forEach(logpage => this.model.addWarning(
						"Note: transcluded on additional log page: "+
						makeLink(logpage.title, logpage.title.replace(this.model.venue.path, ""))
					));
				}
				embeddedinLogpage = embeddedInLogpages[0];
			}
			return $.when(this.getLogInfo(embeddedinLogpage)).then(logInfo => {
				if ( this.model.aborted ) {
					return rejection("abort"); 
				}
				this.model.discussion.setRelistInfo({
					today: RelistInfo.today,
					discussionPageTimestamps,
					newWikitext,
					oldLogWikitext,
					...logInfo
				});
				this.model.trackStep();
			});
		}).catch((code, error) => {
			this.model.setAborted();
			if ( code === "abort" ) {
				this.model.addError(`Aborted${typeof error === "string"
					? ": " + error
					: "."
				}`);
			} else {
				this.model.addError(`Aborted: ${code||"unknown"} error`);
				this.logError(code, error);
			}	
			return rejection();
		});
	}
}
// </nowiki>