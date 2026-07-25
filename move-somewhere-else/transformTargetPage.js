// TODO: rename and move this file

/**
 * Look at every instance of {{Merge}}, {{merge from}}, {{Merge to}}, {{Article for deletion/dated}}, {{being merged to}}, {{being merged}}, {{being merged from}}, {{Merge portions from}}, or one of their aliases, and remove every one where the Source page or the NominationName appear {{inside it}}. Don't check the parameter names at all, just their values.
 *
 * When removing {{Article for deletion/dated}} or one of its aliases, also remove the <!-- hidden comments --> around it.
 *
 * This is not able to handle nested templates. Hopefully that never happens, else a more complicated solution will be needed.
 */
function removeTagsFromTargetPage(oldWikicode, sourcePage, nominationName) {
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
	const normalizedSourcePage = spacesToUnderscores(sourcePage);
	const normalizedNominationName = spacesToUnderscores(nominationName);
	
	// Process AFD templates first, since they have special comments around them that need to be removed as well
	const afdPattern = afdTemplates.map(t => t.replace(/ /g, "[_ ]")).join("|");
	newWikicode = newWikicode.replace(
		new RegExp(`<!-- Please do not remove or change this AfD message until the discussion has been closed\\. -->\\s*{{(${afdPattern})(?:\\|[^}]*)?}}\\s*<!-- Once discussion is closed.*?<!-- End of AfD message.*?-->\\n`, "gis"),
		(match) => {
			if (spacesToUnderscores(match).includes(normalizedSourcePage) || spacesToUnderscores(match).includes(normalizedNominationName)) {
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
				const fullTemplate = extractTemplateContent(newWikicode, i);
				
				if (fullTemplate && templateOpenRegex.test(fullTemplate)) {
					// Check if this template should be removed
					if (spacesToUnderscores(fullTemplate).includes(normalizedSourcePage) || spacesToUnderscores(fullTemplate).includes(normalizedNominationName)) {
						const templateEnd = i + fullTemplate.length;
						
						// Check for preceding newline to also remove
						let removeStart = i;
						if (i > 0 && newWikicode[i - 1] === "\n") {
							removeStart = i - 1;
						}
						
						// Get characters around the removal point
						const charBefore = removeStart > 0 ? newWikicode[removeStart - 1] : "";
						const charAfter = templateEnd < newWikicode.length ? newWikicode[templateEnd] : "";
						
						// Remove the template
						newWikicode = newWikicode.substring(0, removeStart) + newWikicode.substring(templateEnd);
						
						// Add newline if needed to separate non-newline content
						if (charBefore && charAfter && charBefore !== "\n" && charAfter !== "\n") {
							newWikicode = newWikicode.substring(0, removeStart) + "\n" + newWikicode.substring(removeStart);
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

function spacesToUnderscores(str) {
	return str.replace(/ /g, "_").toLowerCase();
}

/** Function to extract template content between {{ and }} */
function extractTemplateContent(wikicode, startIndex) {
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
				return wikicode.substring(startIndex, i);
			}
		} else {
			i++;
		}
	}
	return null;
}

module.exports = removeTagsFromTargetPage;
