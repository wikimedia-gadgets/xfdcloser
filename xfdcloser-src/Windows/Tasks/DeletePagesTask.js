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

	const apiDeletePage = (page, isRetry) => {
		const pageText = page.getPrefixedText();
		const pageLink = extraJs.makeLink(pageText).get(0).outerHTML;
		if (!page.exists()) {
			this.addWarning(
				`${pageLink} skipped: does not exist (may have already been deleted by others)`
			);
			this.trackStep({failed: true});
			return;
		}

		return this.api.postWithToken( "csrf", {
			action: "delete",
			title: pageText,
			reason: `[[${this.discussion.getNomPageLink()}]] ${this.appConfig.script.advert}`
		} )
			.then( () => this.trackStep() )
			.catch( (code, error) => {
				if (!isRetry) {
					return apiDeletePage(page, true);
				}
				this.addError(
					`Could not delete page ${pageLink}`,
					{code, error}
				);
				this.trackStep({failed: true});
			} );
	};

	return $.when.apply(null,
		this.pages.map(page => apiDeletePage(page))
	).then(() => {
		// All errors already handled above, just need to determine task status
		if (this.steps.completed === 0) {
			return "Failed";
		} else if (this.steps.completed < this.steps.total) {
			return "Done with errors";
		}
	});
};

export default DeletePagesTask;
// </nowiki>