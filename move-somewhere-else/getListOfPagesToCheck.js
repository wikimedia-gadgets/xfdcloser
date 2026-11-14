// TODO: rename and move this file

function execute(outcome, sourcePage, targetPage, afdPage, nominationName) {
	// Remove merge and AFD templates from multiple pages
	const listOfPagesToCheck = getListOfPagesToCheck(outcome, sourcePage, targetPage, afdPage);
	for ( const page of listOfPagesToCheck ) {
		const oldWikicode = getOldWikicode(page);
		const newWikicode = removeMergeAndAfdTemplates(oldWikicode, sourcePage, nominationName);
		if ( newWikicode !== oldWikicode ) {
			saveNewWikicode(page, newWikicode);
		}
	}

	/*
	// If and only if the discussion was closed as merge, place {{Being merged from|Source article|afd=NominationName|date=Date of the closure}}, always at the top of the targetPage.
	if ( outcome === "merge" ) {
		const oldWikicode = getOldWikicode(targetPage);
		const newWikicode = addBeingMergedFromTemplate(targetPage, sourcePage, nominationName);
		if ( newWikicode !== oldWikicode ) {
			saveNewWikicode(targetPage, newWikicode);
		}
	}
	*/
}

function getListOfPagesToCheck(outcome, sourcePage, targetPage, afdPage) {
	const pagesToCheck = [];
	
	// If the discussion was closed as merge or redirect, add the Target page to the list, unless it doesn't exist, in which case leave it out.
	if ( outcome === "merge" || outcome === "redirect" ) {
		if ( pageExists(targetPage) ) {
			pagesToCheck.push(targetPage);
		}
	}
	
	/*
	// In addition, add to the list every page in the (Article) or Draft namespaces in the "What links here" of the AfD discussion subpage, excluding the Target page themselves.
	const NS_MAIN = 0;
	const NS_DRAFT = 118;
	let listOfWhatLinksHerePages = getWhatLinksHerePagesFilteredByNamespace(afdPage, [NS_MAIN, NS_DRAFT]);
	listOfWhatLinksHerePages = removeValuesFromArrayCaseInsensitive( listOfWhatLinksHerePages, [targetPage]);
	pagesToCheck.push(...listOfWhatLinksHerePages);
	*/

	return pagesToCheck;
}

function pageExists(page) {
	// TODO
}

/*
function addBeingMergedFromTemplate(targetPage, sourcePage, nominationName) {
	const oldWikicode = getOldWikicode(targetPage);
	const newWikicode = `{{Being merged from|${sourcePage}|afd=${nominationName}|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n` + oldWikicode;
	return newWikicode;
}

function removeValuesFromArrayCaseInsensitive( haystack, needles ) {
	// TODO: remove the needles from the haystack, case insensitive, and treating space and underscore as the same character
}

function getWhatLinksHerePagesFilteredByNamespace(pageBeingLinkedTo, allowedNamespaces) {
	// TODO. requires API call.
}
*/
