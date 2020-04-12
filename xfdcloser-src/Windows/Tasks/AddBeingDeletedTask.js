import Task from "../Components/Task";
// <nowiki>

function AddBeingDeletedTask(config) {
	config = {
		label: `Updating ${config.pageResults.length > 1 ? "templates" : "template"}`,
		...config
	};
	// Call parent constructor
	AddBeingDeletedTask.super.call( this, config );
}
OO.inheritClass( AddBeingDeletedTask, Task );

AddBeingDeletedTask.prototype.doTask = function() {
	this.setTotalSteps(this.pages.length);

	// Merge targets and pages to be merged (if any)
	const mergePageResults = this.pageResults
		.filter(pageResult => pageResult.resultType === "merge");
	const mergeTargets = extraJs.uniqueArray(
		mergePageResults.map(pageResult => pageResult.data.target)
	);
	const mergeTitles = mergePageResults.map(pageResult => pageResult.page.getPrefixedText());

	// Function to transform a simplified API page object into edit parameters for API.editWithRetry
	const transform = (page) => {
		// Check there's a corresponding nominated page
		var pageObj = this.discussion.getPageByTitle(page.title, {"moduledocs": true});
		if ( !pageObj ) {
			return $.Deferred().reject("unexpectedTitle");
		}
		// Check corresponding page exists
		if ( !pageObj.exists() ) {
			return $.Deferred().reject("doesNotExist");
		}

		const pageResult = this.pageResults
			.find(pageResult => pageResult.page.getPrefixedText() === pageObj.getPrefixedText());
		const holdcellsection = pageResult.options.holdcellSection;
		
		// Replace {Template for discussion/dated} or {Tfm/dated} (which
		// may or may not be noincluded)
		const isModule = ( page.title.indexOf("Module:") === 0 );
		const inclusionTag = ( isModule ) ? "includeonly" : "noinclude";
		const oldWikitext = page.content;
		try {
			if ( mergeTargets.includes(page.title) ) {
				// Is a merge target, so just remove nom template
				return {
					text: this.venue.removeNomTemplate(oldWikitext),
					summary: `[[${this.discussion.getNomPageLink()}]] closed as ${this.result} ${this.appConfig.script.advert}`
				};
			} else if ( holdcellsection === "ready" ) {
				// Is ready for deletion, so tag for speedy deletion
				return {
					text: `<${inclusionTag}>{{Db-xfd|fullvotepage=${this.discussion.getNomPageLink()}}}</${inclusionTag}>` +
						this.venue.removeNomTemplate(oldWikitext),
					summary: `[[WP:G6|G6]] Speedy deletion nomination, per [[${this.discussion.getNomPageLink()}]] ${this.appConfig.script.advert}`
				};
			} else {
				// Add Being deleted template, remove nom template
				return {
					text: `<${inclusionTag}>{{Being deleted|${this.discussion.nomDate}|${mw.util.wikiUrlencode(this.discussion.sectionHeader)}${
						mergeTitles.includes(page.title)
							? "|merge=" + pageResult.data.target
							: ""
					}}}</${inclusionTag}>${this.venue.removeNomTemplate(oldWikitext)}`,
					summary: `Added {{being deleted}} per [[${this.discussion.getNomPageLink()}]] ${this.appConfig.script.advert}`
				};
			}
		} catch(e){
			// Error if multiple nom templates found
			return $.Deferred().reject("couldNotUpdate", e);
		}
	};
	
	const templateTitles = this.discussion.getPageTitles(this.pages, {"moduledocs": true});
	return this.api.editWithRetry(
		templateTitles,
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
			case "couldNotUpdate":
				this.addError(
					`Could not update ${titleLink}: ${error.message}`
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
				`Could not read contents of nominated ${templateTitles.length > 1 ? "pages" : "page"}`
			);
			return "Failed";
		}
		// Other errors already handled above, just need to determine task status
		return (this.steps.completed === 0) ? "Failed" : "Done with errors";
	} );
};

export default AddBeingDeletedTask;
// </nowiki>