import Task from "../Components/Task";
// <nowiki>

function TagTalkWithSpeedyTask(config) {
	config = {
		label: `Tagging talk ${config.pageResults.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	TagTalkWithSpeedyTask.super.call( this, config );
}
OO.inheritClass( TagTalkWithSpeedyTask, Task );

TagTalkWithSpeedyTask.prototype.doTask = function() {
	const talkPages = this.discussion.getTalkTitles(this.pages);
	if ( talkPages.length === 0 ) {
		this.addWarning("None found");
		return $.Deferred().resolve("Failed");
	}
	this.setTotalSteps(talkPages.length);

	const talkPagesToTag = talkPages.filter(talkTitle => {
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

	if ( talkPagesToTag.length === 0 ) {
		return $.Deferred().resolve("Skipped.");
	}

	return this.api.editWithRetry(
		talkPagesToTag,
		null,
		() => ({
			prependtext: "{{Db-talk}}\n",
			summary: `[[WP:G8|G8]] Speedy deletion nomination, per [[:${this.discussion.getNomPageLink()}]] ${this.appConfig.script.advert}`,
			nocreate: 1
		}),
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title).get(0).outerHTML;
			this.addError(
				`Could not edit page ${titleLink}`,
				{code, error}
			);
			this.trackStep({failed: true});
		}
	).catch( (errortype, code, error) => {
		if ( errortype === "read" ) {
			this.addError(code, error, 
				`Could not read contents of nominated ${talkPagesToTag.length > 1 ? "pages" : "page"}`
			);
			return "Failed";
		}
		// Other errors already handled above, just need to determine task status
		return (this.steps.completed === 0) ? "Failed" : "Done with errors";
	} );
};

export default TagTalkWithSpeedyTask;
// </nowiki>