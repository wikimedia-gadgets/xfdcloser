import { $, mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import RemoveNomTemplates from "./RemoveNomTemplates";
import { rejection, dmyDateString, uniqueArray } from "../../util";
// <nowiki>

/**
 * @private
 * @prop {String[]} config.from Names of pages to merge from
 * @prop {String} config.to Name pf page to merge to
 * @prop {String} mergeToTemplate Wikitext of template to place on the "from" pages
 * @prop {String[]} mergeFromTemplates Wikitext of templates to place on the "to" page's talk page
 * @prop {Boolean} config.isNominatedPage merge target is one of the pages nominated in the discussion
 */
class Merger {
	/**
	 * @param {Object} config
	 *  @param {String[]} config.from Names of pages to merge from
	 *  @param {String} config.to Name of page to merge to
	 *  @param {String} config.mergeToTemplate Wikitext of template to place on the "from" pages
	 *  @param {String[]} config.mergeFromTemplates Wikitext of templates to place on the "to" page's talk page
	 *  @param {Boolean} config.isNominatedPage merge target is one of the pages nominated in the discussion
	 */
	constructor(config) {
		this.from = config.from;
		this.target = config.target;
		this.mergeToTemplate = config.mergeToTemplate;
		this.mergeFromTemplates = config.mergeFromTemplates;
		this.isNominatedPage = config.isNominatedPage;
	}
	get mergeFromWikitext() {
		return this.mergeFromTemplates.join("");
	}
}

export default class AddMergeTemplatesTask extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Adding merge templates");
	}

	/**
	 * @returns {Merger[]}
	 */
	getMergers() {
		const targets = uniqueArray(
			this.model.getPageResults().map(pageResult => pageResult.getFormattedTarget({raw: true}))
		);
		const curdate = dmyDateString(new Date());
		return targets.map(target => {
			const mergeFromPages = this.model.getPageResults()
				.filter(pageResult => pageResult.getFormattedTarget({raw: true}) === target )
				.map(pageResult => this.model.discussion.redirects.resolveOne(pageResult.pageName)
				);
			const mergeToTemplate = this.model.venue.wikitext.mergeTo
				.replace(/__TARGET__/, target)
				.replace(/__DEBATE__/, this.model.discussion.discussionSubpageName)
				.replace(/__DATE__/, curdate)		
				.replace(/__TARGETTALK__/, mw.Title.newFromText(target).getTalkPage().getPrefixedText());
			const mergeFromTemplates = mergeFromPages
				.map( pageName => this.model.venue.wikitext.mergeFrom
					.replace(/__NOMINATED__/, pageName)
					.replace(/__DEBATE__/, this.model.discussion.discussionSubpageName)
					.replace(/__DATE__/, curdate)
				);
			const isNominatedPage = this.model.discussion.pagesNames.includes(this.model.discussion.redirects.unresolveOne(target));
			return new Merger({
				from: mergeFromPages,
				target,
				mergeToTemplate,
				mergeFromTemplates,
				isNominatedPage
			});
		});
	}

	transformTargetTalk(page) {
		if ( this.model.aborted ) return rejection("aborted");

		const merger = this.getMergers().find(
			merger => mw.Title.newFromText(merger.target).getTalkPage().getPrefixedText() === page.title
		);
		if ( !merger ) {
			return rejection("unexpectedTarget");
		}
		return {
			prependtext: merger.mergeFromWikitext,
			summary: this.model.getEditSummary()
		};
	}

	transformNominatedPage(page) {
		if ( this.model.aborted ) return rejection("aborted");

		const merger = this.getMergers().find(merger => merger.from.includes(page.title));
		if ( !merger ) {
			return rejection("unexpectedTitle");
		}
		return RemoveNomTemplates.transform(this, page, merger.mergeToTemplate);
	}

	doTask() {
		const mergers = this.getMergers();
		if ( mergers.length === 0 ) {
			this.model.addWarning("None found");
			return rejection();
		}
		// Filter out targets which are also nominated pages
		const mergersToNotNominatedPages = mergers.filter(merger => !merger.isNominatedPage);

		this.model.setTotalSteps(this.model.pageTitles.length + mergersToNotNominatedPages.length);
		this.model.setDoing();

		// Edit the talk pages of the merge targets which are not nominated pages
		const editTargetsTalkPages = mergersToNotNominatedPages.length && this.api.editWithRetry(
			mergersToNotNominatedPages.map(
				merger => mw.Title.newFromText(merger.target).getTalkPage().getPrefixedText()
			),
			null,
			page => this.transformTargetTalk(page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch( (errortype, code, error) => {
			if ( errortype === "read" ) {
				this.model.addError(code, error, 
					`Could not read contents of target talk ${mergersToNotNominatedPages.length > 1 ? "pages" : "page"}`
				);
			}
			// Other errors already handled above
		} );

		const editNominatedPages = this.api.editWithRetry(
			this.model.getResolvedPageNames(),
			null,
			page => this.transformNominatedPage(page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch( (errortype, code, error) => {
			if ( errortype === "read" ) {
				this.model.addError(code, error, 
					`Could not read contents of nominated ${this.model.pageNames.length > 1 ? "pages" : "page"}`
				);
			}
			// Other errors already handled above
		} );

		return $.when(editTargetsTalkPages, editNominatedPages);
	}
}
// </nowiki>