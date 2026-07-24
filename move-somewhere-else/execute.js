// TODO: rename and move this file

function execute() {
	const listOfPagesToCheck = getListOfPagesToCheck(outcome, sourcePage, targetPage, afdPage, xfdType);
	for ( const page of listOfPagesToCheck ) {
		const oldWikicode = getOldWikicode(page);
		const newWikicode = removeTagsFromTargetPage(oldWikicode, sourcePage, targetPage, nominationName, dateOfClosure);
		if ( newWikicode !== oldWikicode ) {
			saveNewWikicode(page, newWikicode);
		}
	}
}
