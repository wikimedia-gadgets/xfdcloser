import TaskItemController from "../TaskItemController";
import { $, mw } from "../../../globals";
import { rejection, uniqueArray } from "../../util";
// <nowiki>

export default class RemoveMergeTemplates extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Removing merge templates");
	}

	doTask() {
		// Add target pages for AFD merge and AFD redirect outcomes.
		// MFD merge outcomes keep the existing merge action, so do not remove their merge templates.
		const pageResults = this.model.getPageResults().filter(pageResult => {
			const action = this.model.options.getOptionValues(pageResult.selectedResultName)?.action;
			return (pageResult.selectedResultName === "merge" && action === "mergeAndUpdate") ||
				(pageResult.selectedResultName === "redirect" && action === "redirectAndUpdate");
		});
		if ( !pageResults.length ) {
			this.model.setTotalSteps(1);
			this.model.trackStep("skipped");
			return $.Deferred().resolve().promise();
		}
		const sourcePages = pageResults.map(pageResult =>
			this.model.discussion.redirects.resolveOne(pageResult.pageName)
		);
		// There can be multiple target pages.
		const targetPages = uniqueArray(pageResults.map(pageResult =>
			mw.Title.newFromText(pageResult.getFormattedTarget({raw: true})).getPrefixedText()
		));

		// Just removeMergeTemplatesFromWikicode() on target pages for now.
		// If we need to removeMergeTemplatesFromWikicode() on more pages in the future, they can be added to this array.
		const pagesToRemoveMergeTemplatesFrom = targetPages;

		this.model.setTotalSteps(pagesToRemoveMergeTemplatesFrom.length);
		this.model.setDoing();
		return this.api.editWithRetry(
			pagesToRemoveMergeTemplatesFrom,
			null,
			page => {
				if ( this.model.aborted ) return rejection("aborted");
				if ( page.missing ) return rejection("doesNotExist");

				// There can be multiple merge sources, so remove each source's template from this page.
				let text = page.content;
				for (const sourcePage of sourcePages) {
					text = this.removeMergeTemplatesFromWikicode(
						text,
						sourcePage,
						this.model.discussion.discussionPageName
					);
				}
				if ( text === page.content ) return rejection("skippedNoneFound");
				return { text, summary: this.model.getEditSummary() };
			},
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch((errortype, code, error) => this.handleOverallError(errortype, code, error));
	}

	/**
	 * Look at every instance of {{Merge}}, {{merge from}}, {{Merge to}}, {{Article for deletion/dated}}, {{being merged to}}, {{being merged}}, {{being merged from}}, {{Merge portions from}}, or one of their aliases, and remove every one where the Source page or the NominationName appear {{inside it}}. Don't check the parameter names at all, just their values.
	 *
	 * When removing {{Article for deletion/dated}} or one of its aliases, also remove the <!-- hidden comments --> around it.
	 */
	removeMergeTemplatesFromWikicode(oldWikicode, sourcePage, nominationName) {
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
		const templateOpenRegex = new RegExp(`^{{(${templatePatterns})(?:\\s|\\|)?`, "i");
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
}
// </nowiki>
