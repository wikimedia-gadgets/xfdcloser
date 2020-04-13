import Task from "../Components/Task";
// <nowiki>

function DeletePagesTask(config) {
	config = {
		label: `Deleting ${config.pageResults.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	DeletePagesTask.super.call( this, config );
}
OO.inheritClass( DeletePagesTask, Task );

DeletePagesTask.prototype.doTask = function() {
	if ( this.pages.length === 0 ) {
		this.addWarning("None found");
		return $.Deferred().resolve("Failed");
	}
	this.setTotalSteps(this.pages.length);

	const pagesToDelete = this.pages.filter(page => {
		if (!page.exists()) {
			const pageLink = extraJs.makeLink(page.getPrefixedText()).get(0).outerHTML;
			this.addWarning(
				`${pageLink} skipped: does not exist (may have already been deleted by others)`
			);
			this.trackStep({failed: true});
			return false;
		}
		return true;
	});
	const reason = `[[${this.discussion.getNomPageLink()}]] ${this.appConfig.script.advert}`;

	return this.api.deleteWithRetry(
		pagesToDelete.map(page => page.getPrefixedText()),
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

export default DeletePagesTask;
// </nowiki>