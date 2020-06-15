import { rejection, decodeHtml } from "../../util";
import config from "../../config";
import TaskItemController from "../TaskItemController";
// <nowiki>

export default class CloseDiscussion extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Closing discussion");
	}

	/**
	 * Convert wikitext of a heading to equivilent plain text displayed when
	 * parsed. While not 100% accurate, this is much faster than parsing via
	 * the API, and it works for the vast majority of cases: mostly plain
	 * text, sometimes with links, tl templates, multiple spaces, and/or
	 * HTML-encoded entities.
	 * 
	 * @param {String} wikitext
	 * @returns {String} plain text
	 */
	static sectionHeadingText = function(wikitext) {
		return decodeHtml(wikitext // decode entities, e.g "&amp;" to "&"
			.replace(/(?:^\s*=*\s*|\s*=*\s*$)/g, "") // remove heading markup
			.replace(/\[\[:?(?:[^\]]+\|)?([^\]]+)\]\]/g, "$1") // replace link markup with link text
			.replace(/{{\s*[Tt]l[a-z]?\s*\|\s*([^}]+)}}/g, "{{$1}}") // replace tl templates
			.replace(/s*}}/, "}}") // remove any extra spaces after replacing tl templates
			.replace(/\s{2,}/g, " ") // collapse multiple spaces into a single space
			.trim()
		);
	}

	transform(page) {
		if ( this.model.aborted ) return rejection("aborted");

		// Check if already closed
		if ( page.content.includes(this.model.venue.wikitext.alreadyClosed) ) {
			this.model.addError("Discussion already closed (reload page to see the close)");
			return rejection("abort");
		}
		// Check for edit conflict based on start time (only possible for venues with individual subpages)
		if ( this.model.venue.hasIndividualSubpages && config.startTime < new Date(page.revisions[0].timestamp) ) {
			this.model.addError("Edit conflict detected");
			return rejection("abort");
		}
		// Check for possible edit conflict based on section heading
		const section_heading = page.content.slice(0, page.content.indexOf("\n"));
		const sectionHeadingText = CloseDiscussion.sectionHeadingText(section_heading);
		if ( sectionHeadingText !== this.model.discussion.sectionHeader ) {
			this.model.addError(`Possible edit conflict detected, found section heading"${sectionHeadingText}"`);
			return rejection("abort");
		}

		const xfd_close_top = this.model.venue.wikitext.closeTop
			.replace(/__RESULT__/, this.model.result.getResultText() || "&thinsp;")
			.replace(/__TO_TARGET__/, this.model.result.getFormattedTarget({prepend: "to "}))
			.replace(/__RATIONALE__/, this.model.result.getFormattedRationale("punctuated") || ".")
			.replace(/__SIG__/, config.user.sig);
		const section_content = page.content
			.slice(page.content.indexOf("\n") + 1)
			.replace(
				/({{closing}}|{{AfDh}}|{{AfDb}}|\{\{REMOVE THIS TEMPLATE WHEN CLOSING THIS AfD\|.?\}\}|<noinclude>\[\[Category:Relisted AfD debates\|.*?\]\](\[\[Category:AfD debates relisted 3 or more times|.*?\]\])?<\/noinclude>)/gi,
				"");
		const updated_top = this.model.venue.hasIndividualSubpages
			? xfd_close_top + "\n" + section_heading
			: section_heading + "\n" + xfd_close_top;
		const updated_section = updated_top + "\n" + section_content.trim() + "\n" + this.model.venue.wikitext.closeBottom;

		return {
			section: this.model.discussion.sectionNumber,
			text: updated_section,
			summary: `/* ${this.model.discussion.sectionHeader} */ Closed as ${this.model.result.getResultText()} ${config.script.advert}`
		};
	}

	doTask = function() {
		this.model.setTotalSteps(1);
		this.model.setDoing();
		return this.api.editWithRetry(
			this.model.discussion.discussionPageName,
			{ rvsection: this.model.discussion.sectionNumber },
			page => this.transform(page),
			() => this.model.trackStep(),
			(code, error, title) => {
				this.handlePageError("abort");
				if ( code !== "abort" && code !== "aborted" ) {
					this.handlePageError(code, error, title);
				}
			}
		).catch((errortype, code, error) => {
			this.model.setAborted();
			this.handleOverallError(errortype, code, error);
			return rejection();
		});
	};
}
// </nowiki>