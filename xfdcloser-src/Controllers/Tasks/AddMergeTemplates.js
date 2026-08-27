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

	/**
	* Look at every instance of {{Merge}}, {{merge from}}, {{Merge to}}, {{Article for deletion/dated}}, {{being merged to}}, {{being merged}}, {{being merged from}}, {{Merge portions from}}, or one of their aliases, and remove every one where the Source page or the NominationName appear {{inside it}}. Don't check the parameter names at all, just their values.
	*
	* When removing {{Article for deletion/dated}} or one of its aliases, also remove the <!-- hidden comments --> around it.
	*
	* This is not able to handle nested templates. Hopefully that never happens, else a more complicated solution will be needed.
	*/
	removeMergeAndAfdTemplates(oldWikicode, sourcePage, nominationName) {
		let newWikicode = oldWikicode;
		// {{Merge}}, {{merge from}}, {{Merge to}}, {{Article for deletion/dated}}, {{being merged to}}, {{being merged}}, {{being merged from}}, {{Merge portions from}}
		const mergeTemplates = [
			"Merge", /* aliases: */ "Mergedisputed", "Mergewith", "MergeDisputed", "MergeVfD", "Merge-disputed", "Merge disputed", "Merge-multiple", "Mergesplit", "MergeSplit", "Mergemulti", "Mergetomultiple-with", "Multimerge", "Proposed merge", "Merge with",

			"Merge from", /* aliases: */ "Merge-from", "Include", "Mergefrom-multiple", "Multiplemergefrom", "Mergefrommulti", "Mergefrommultiple", "Multimergefrom", "Mergefrom-category", "MergeFrom", "Mergefrom", "Merge from draft", "Merge from AfD",

			"Merge to", /* aliases: */ "Merge-to", "Mergeinto", "MergePartial", "MergetoCat", "Mergelist", "Mergeto-disputed", "Mergeto-multiple", "Multiplemergeinto", "Multiplemergeto", "Multiple-merge-to", "Merge into", "MergeTo", "Mergeto", "Merge to article", "Merge2", "Merge-into",

			"Being merged to", /* aliases: */ "Merging to", "Being Merge to", "Being merge to", "Merging into", "Merginginto", "Mergingto", "Merging-to",

			"Being merged", /* aliases: */ "Merging", "Mergingsectionto",

			"Being merged from", /* aliases: */ "Merging from", "Mergingfrom", "Being Merge from", "Being merge from", "Merging-from",

			"Merge portions from", /* aliases: */ "Move section portions from", "Move portions from", "Merge section portions from",
		];
		const afdTemplates = [
			"Article for deletion/dated", /* aliases: */ "AfDM", "Afd/dated", "AfD/dated", "Afdm",
		];
		const allTemplates = mergeTemplates.concat(afdTemplates);
		const normalizedSourcePage = this.spacesToUnderscores(sourcePage);
		const normalizedNominationName = this.spacesToUnderscores(nominationName);
		
		// Process AFD templates first, since they have special comments around them that need to be removed as well
		const afdPattern = afdTemplates.map(t => t.replace(/ /g, "[_ ]")).join("|");
		newWikicode = newWikicode.replace(
			new RegExp(`<!-- Please do not remove or change this AfD message until the discussion has been closed\\. -->\\s*{{(${afdPattern})(?:\\|[^}]*)?}}\\s*<!-- Once discussion is closed.*?<!-- End of AfD message.*?-->\\n`, "gis"),
			(match) => {
				if (this.spacesToUnderscores(match).includes(normalizedSourcePage) || this.spacesToUnderscores(match).includes(normalizedNominationName)) {
					return "";
				}
				return match;
			}
		);

		// Process all other templates
		const templatePatterns = allTemplates.map(t => t.replace(/ /g, "[_ ]")).join("|");
		const templateOpenRegex = new RegExp(`{{(${templatePatterns})(?:\\s|\\|)?`, "i");
		let changed = true;
		while (changed) {
			changed = false;
			for (let i = 0; i < newWikicode.length - 1; i++) {
				if (newWikicode[i] === "{" && newWikicode[i + 1] === "{") {
					const fullTemplate = this.extractTemplateContent(newWikicode, i);
					
					if (fullTemplate && templateOpenRegex.test(fullTemplate)) {
						// Check if this template should be removed
						if (this.spacesToUnderscores(fullTemplate).includes(normalizedSourcePage) || this.spacesToUnderscores(fullTemplate).includes(normalizedNominationName)) {
							const templateEnd = i + fullTemplate.length;
							
							// Check for preceding or trailing newline to also remove
							let removeStart = i;
							let removeEnd = templateEnd;
							if (i > 0 && newWikicode[i - 1] === "\n") {
								removeStart = i - 1;
							} else if (i === 0 && templateEnd < newWikicode.length && newWikicode[templateEnd] === "\n") {
								removeEnd = templateEnd + 1;
							}
							
							// Get characters around the removal point
							const charBefore = removeStart > 0 ? newWikicode[removeStart - 1] : "";
							const charAfter = removeEnd < newWikicode.length ? newWikicode[removeEnd] : "";
							
							// Remove the template
							newWikicode = newWikicode.slice(0, removeStart) + newWikicode.slice(removeEnd);
							
							// Add newline if needed to separate non-newline content
							if (charBefore && charAfter && charBefore !== "\n" && charAfter !== "\n") {
								newWikicode = newWikicode.slice(0, removeStart) + "\n" + newWikicode.slice(removeStart);
							}
							
							changed = true;
							break;
						}
					}
				}
			}
		}

		return newWikicode;
	}

	spacesToUnderscores(str) {
		return str.replace(/ /g, "_").toLowerCase();
	}

	/** Function to extract template content between {{ and }} */
	extractTemplateContent(wikicode, startIndex) {
		let braceCount = 0;
		let i = startIndex;
		while (i < wikicode.length) {
			if (wikicode[i] === "{" && i + 1 < wikicode.length && wikicode[i + 1] === "{") {
				braceCount++;
				i += 2;
			} else if (wikicode[i] === "}" && i + 1 < wikicode.length && wikicode[i + 1] === "}") {
				braceCount--;
				i += 2;
				if (braceCount === 0) {
					return wikicode.slice(startIndex, i);
				}
			} else {
				i++;
			}
		}
		return null;
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
