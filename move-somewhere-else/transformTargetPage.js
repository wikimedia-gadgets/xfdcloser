// TODO: rename and move this file

function removeTagsFromTargetPage(oldWikicode, sourcePage, nominationName) {
	let newWikicode = oldWikicode;

	// {{Merge}}, {{merge from}}, {{Merge to}}, {{Article for deletion/dated}}, {{being merged to}}, {{being merged}}, {{being merged from}}, {{Merge portions from}}
	const templates = [
		"Merge", /* aliases: */ "Mergedisputed", "Mergewith", "MergeDisputed", "MergeVfD", "Merge-disputed", "Merge disputed", "Merge-multiple", "Mergesplit", "MergeSplit", "Mergemulti", "Mergetomultiple-with", "Multimerge", "Proposed merge", "Merge with",

		"Merge from", /* aliases: */ "Merge-from", "Include", "Mergefrom-multiple", "Multiplemergefrom", "Mergefrommulti", "Mergefrommultiple", "Multimergefrom", "Mergefrom-category", "MergeFrom", "Mergefrom", "Merge from draft", "Merge from AfD",

		"Merge to", /* aliases: */ "Merge-to", "Mergeinto", "MergePartial", "MergetoCat", "Mergelist", "Mergeto-disputed", "Mergeto-multiple", "Multiplemergeinto", "Multiplemergeto", "Multiple-merge-to", "Merge into", "MergeTo", "Mergeto", "Merge to article", "Merge2", "Merge-into",

		"Article for deletion/dated", /* aliases: */ "AfDM", "Afd/dated", "AfD/dated", "Afdm",

		"Being merged to", /* aliases: */ "Merging to", "Being Merge to", "Being merge to", "Merging into", "Merginginto", "Mergingto", "Merging-to",

		"Being merged", /* aliases: */ "Merging", "Mergingsectionto",

		"Being merged from", /* aliases: */ "Merging from", "Mergingfrom", "Being Merge from", "Being merge from", "Merging-from",

		"Merge portions from", /* aliases: */ "Move section portions from", "Move portions from", "Merge section portions from",
	];

	// Now that you have that list of pages, look at every instance of {{Merge}}, {{merge from}}, {{Merge to}}, {{Article for deletion/dated}}, {{being merged to}}, {{being merged}}, {{being merged from}}, {{Merge portions from}}, or one of their redirects, and remove every one where the Source page or the NominationName appear {{inside it}}. Don't check the parameter names at all, just their values.
	// When removing {{Article for deletion/dated}} or one of its redirects, also remove the <! -- hidden comments -- > around it.
	// This is not able to handle nested templates. Hopefully that never happens, else a more complicated solution will be needed.

	// TODO

	return newWikicode;
}
