import Task from "../Components/Task";
// <nowiki>

function DisambiguateTask(config) {
	config = {
		label: `Updating ${config.pageResults.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	DisambiguateTask.super.call( this, config );
}
OO.inheritClass( DisambiguateTask, Task );

DisambiguateTask.prototype.doTask = function() {
	const pageTitles = this.discussion.getPageTitles(this.pages);
	if ( pageTitles.length === 0 ) {
		this.addWarning("None found");
		return $.Deferred().resolve("Failed");
	}
	this.setTotalSteps(pageTitles.length);

	const transform = (page) => {
		// Check there's a corresponding nominated page
		const pageObj = this.discussion.getPageByTitle(page.title, {"moduledocs": true});
		if ( !pageObj ) {
			return $.Deferred().reject("unexpectedTitle");
		}
		// Check corresponding page exists
		if ( !pageObj.exists() ) {
			return $.Deferred().reject("doesNotExist");
		}
		const oldWikitext = page.content;
		let updatedWikitext = "";

		if ( this.venue.regex.fullNomTemplate.test(oldWikitext) ) {
			updatedWikitext = oldWikitext.replace(this.venue.regex.fullNomTemplate, "").trim();
		} else {
			this.addWarning(
				`Nomination template not found on page ${extraJs.makeLink(page.title).get(0).outerHTML}`
			);
			updatedWikitext = oldWikitext.replace(/^#REDIRECT/mi, "*");
		}
		
		if ( !(/(?:disambiguation|disambig|dab|Mil-unit-dis|Numberdis)[^{]*}}/i.test(updatedWikitext)) ) {
			updatedWikitext += "\n{{Disambiguation cleanup|{{subst:DATE}}}}";
			updatedWikitext.trim();
		}
		
		return {
			text: updatedWikitext,
			summary: `${this.venue.type.toUpperCase()} closed as ${this.formData.resultWikitext} ${this.appConfig.script.advert}`
		};
	};

	return this.api.editWithRetry(
		pageTitles,
		null,
		page => transform(page),
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title).get(0).outerHTML;
			switch(code) {
			case "unexpectedTitle":
				this.addError(
					`API query result included unexpected title ${titleLink}; this page will not be edited`
				);
				this.trackStep({failed: true});
				break;
			case "doesNotExist":
				this.addError(
					`${titleLink} does not exist, and will not be edited`
				);
				this.trackStep({failed: true});
				break;
			default:
				this.addError(
					`Could not edit page ${titleLink}`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		}
	).catch( (errortype, code, error) => {
		if ( errortype === "read" ) {
			this.addError(code, error, 
				`Could not read contents of nominated ${pageTitles.length > 1 ? "pages" : "page"}`
			);
			return "Failed";
		}
		// Other errors already handled above, just need to determine task status
		return (this.steps.completed === 0) ? "Failed" : "Done with errors";
	} );
};

export default DisambiguateTask;
// </nowiki>