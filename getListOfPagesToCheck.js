// TODO: rename and move this file

function getListOfPagesToCheck(outcome, sourcePage, targetPage, afdPage, xfdType) {
	const pagesToCheck = [];
	
	// If the discussion was closed as merge or redirect, add the Target page to the list, unless it is currently a redirect or it doesn't exist, in which case leave it out. (If it is a redirect, checking if it contains any merge templates is useless because it's just a redirect...)
	if ( outcome === "merge" || outcome === "redirect" ) {
		if ( pageExists(targetPage) && !pageIsRedirect(targetPage) ) {
			pagesToCheck.push(targetPage);
		}
	}
	
	// If the discussion was closed as keep, no consensus, or custom, add the Source page (the nominated article) to the list, unless it is currently a redirect or it doesn't exist.
	if ( outcome === "keep" || outcome === "no consensus" || outcome === "custom" ) {
		if ( pageExists(sourcePage) && !pageIsRedirect(sourcePage) ) {
			pagesToCheck.push(sourcePage);
		}
	}
	
	// In addition, add to the list every page in the (Article) or Draft namespaces in the "What links here" of the AfD discussion subpage, excluding the Source page and the Target page themselves.
	let listOfWhatLinksHerePages = [];
	if ( xfdType === "afd" ) {
		listOfWhatLinksHerePages = getWhatLinksHerePagesFilteredByNamespace(afdPage, [NS_MAIN, NS_DRAFT]);
	}
	listOfWhatLinksHerePages = removeValuesFromArrayCaseInsensitive( listOfWhatLinksHerePages, [sourcePage, targetPage]);
	pagesToCheck.push(...listOfWhatLinksHerePages);
	
	return pagesToCheck;
}

function removeValuesFromArrayCaseInsensitive( haystack, needles ) {
	// TODO: remove the needles from the haystack, case insensitive, and treating space and underscore as the same character
}

function getWhatLinksHerePagesFilteredByNamespace(pageBeingLinkedTo, allowedNamespaces) {
	// TODO. requires API call.
}

function pageIsRedirect(page) {
	// TODO
}

function pageExists(page) {
	// TODO
}
