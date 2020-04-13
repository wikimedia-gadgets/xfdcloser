import Task from "../Components/Task";
// <nowiki>

function DeleteTalkpagesTask(config) {
	config = {
		label: `Deleting talk ${config.pageResults.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	DeleteTalkpagesTask.super.call( this, config );
}
OO.inheritClass( DeleteTalkpagesTask, Task );

DeleteTalkpagesTask.prototype.doTask = function() {
	const talkPages = this.discussion.getTalkTitles(this.pages);
	if ( talkPages.length === 0 ) {
		this.addWarning("None found");
		return $.Deferred().resolve("Failed");
	}
	this.setTotalSteps(talkPages.length);

	const talkPagesToDelete = talkPages.filter(talkTitle => {
		const subjectPage = this.discussion.getPageByTalkTitle(talkTitle);
		const talkPageExists = subjectPage.getTalkPage().exists();
		const isUserTalkBasePage = ( subjectPage.getNamespaceId() === 2 ) && ( !talkTitle.includes("/") );
		const talkPageLink = extraJs.makeLink(talkTitle).get(0).outerHTML;

		if ( !talkPageExists ) {
			this.addWarning(
				`${talkPageLink} skipped: does not exist (may have already been deleted by others)`
			);
			this.trackStep({failed: true});
			return false;
		}
		if ( isUserTalkBasePage ) {
			self.addWarning(
				`${talkPageLink} skipped: base user talk page (not eligible for G8 speedy deletion)`
			);
			this.trackStep({failed: true});
			return false;
		}
		return true;
	});
	const reason = `[[WP:G8|G8]]: [[${this.discussion.getNomPageLink()}]] closed as ${this.result} ${this.appConfig.script.advert}`;

	return this.api.deleteWithRetry(
		talkPagesToDelete,
		{reason},
		() => { this.trackStep(); },
		(code, error, title) => {
			this.addError(
				`Could not delete page ${extraJs.makeLink(title).get(0).outerHTML}`,
				{code, error}
			);
			this.trackStep({failed: true});
		}
	).catch( // Errors already handled above, just need to determine task status
		() => (this.steps.completed === 0) ? "Failed" : "Done with errors"
	);
};

export default DeleteTalkpagesTask;
// </nowiki>