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

	// TODO: nothing calls this function yet. look at Trialpear's patch to see what needs to call this.
	// TODO: figure out how I'm going to do things to templates. RegEx? Does XFDcloser have a class to help with this? (see Trialpear's patch) Should I just use the Bhsd template helper library?
	transformTargetPage(oldWikicode, sourcePage, targetPage, nominationName, dateOfClosure) {
		let newWikicode = oldWikicode;

		const mergeFromTemplates = [
			"Merge", /* aliases: */ "Mergedisputed", "Mergewith", "MergeDisputed", "MergeVfD", "Merge-disputed", "Merge disputed", "Merge-multiple", "Mergesplit", "MergeSplit", "Mergemulti", "Mergetomultiple-with", "Multimerge", "Proposed merge", "Merge with",

			"Merge from", /* aliases: */ "Merge-from", "Include", "Mergefrom-multiple", "Multiplemergefrom", "Mergefrommulti", "Mergefrommultiple", "Multimergefrom", "Mergefrom-category", "MergeFrom", "Mergefrom", "Merge from draft", "Merge from AfD",

			"Being merged", /* aliases: */ "Merging", "Mergingsectionto",

			"Being merged from", /* aliases: */ "Merging from", "Mergingfrom", "Being Merge from", "Being merge from", "Merging-from",

			"Merge portions from", /* aliases: */ "Move section portions from", "Move portions from", "Merge section portions from",
		];
		const mergeToTemplates = [
			"Merge to", /* aliases: */ "Merge-to", "Mergeinto", "MergePartial", "MergetoCat", "Mergelist", "Mergeto-disputed", "Mergeto-multiple", "Multiplemergeinto", "Multiplemergeto", "Multiple-merge-to", "Merge into", "MergeTo", "Mergeto", "Merge to article", "Merge2", "Merge-into",

			"Being merged to", /* aliases: */ "Merging to", "Being Merge to", "Being merge to", "Merging into", "Merginginto", "Mergingto", "Merging-to",

			"Article for deletion/dated", /* aliases: */ "AfDM", "Afd/dated", "AfD/dated", "Afdm",
		];
		const mergeFromTemplatesCount = oldWikicode.match(new RegExp(`{{\\s*(${mergeFromTemplates.join("|")})\\s*[|}]`, "gi"))?.length || 0;
		if ( !mergeFromTemplatesCount ) {
			// Add {{Being merged from}} template
			newWikicode = `{{Being merged from|${sourcePage}|afd=${nominationName}|date=${dateOfClosure}}}\n` + newWikicode;
			// Delete "Merge to" templates
			newWikicode = this.deleteTemplatesIfPresent(mergeToTemplates, newWikicode);
			// Delete hidden HTML comments from {{Articles for deletion/dated}}
			// newWikicode = newWikicode.replace(/<!--[\s\S]*?-->/gi, "");
		} else {
			if ( mergeFromTemplatesCount > 1 ) {
				// remove all of them except the last one
			}
			const sourceArticleMatches = /* TODO */ false; // check whether the existing |1="Source article" matches the article that was nominated. missing parameter = mismatch.
			const nominationNameMatches = /* TODO */ false; // check whether the |afd= parameter (or one of its aliases: discuss, discussion, talk) contains the correct NominationName (e.g., Earth (8th nomination)). missing parameter = mismatch.
			if ( sourceArticleMatches && nominationNameMatches ) {
				// replace template with {{Being merged from|Source article|afd=NominationName|date=Date of the closure}} on the exact same line
			} else {
				// remove template
				// add {{Being merged from|Source article|afd=NominationName|date=Date of the closure}} at the top of the article, but below hatnotes
			}
		}
		return newWikicode;
	}

	/**
	 * @param {string|array} templateNames
	 */
	deleteTemplatesIfPresent(templateNames, wikicode) {
		if ( typeof templateNames === "string" ) {
			templateNames = [templateNames];
		}
		for ( const templateName of templateNames ) {
			// if it's on its own line, also delete the line break at the end
			wikicode = wikicode.replace(new RegExp(`^\\s*{{\\s*${templateName}\\s*[^}]*}}\\s*\\n`, "gim"), "");
			// if it's not on its own line, don't delete any line breaks
			wikicode = wikicode.replace(new RegExp(`{{\\s*${templateName}\\s*[^}]*}}`, "gi"), "");
		}
		return wikicode;
	}

	doTask() {
		const mergers = this.getMergers();
		if ( mergers.length === 0 ) {
			this.model.addWarning("None found");
			return rejection();
		}
		// Filter out targets which are also nominated pages
		const mergersToNotNominatedPages = mergers.filter(merger => !merger.isNominatedPage);

		this.model.setTotalSteps(this.model.pageNames.length + mergersToNotNominatedPages.length);
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
