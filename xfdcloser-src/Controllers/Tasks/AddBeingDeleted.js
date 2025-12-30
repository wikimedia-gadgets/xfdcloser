import { rejection, encodeForWikilinkFragment, ymdDateString, uniqueArray, isModule, moduleToDoc, docToModule } from "../../util";
import TaskItemController from "../TaskItemController";
// <nowiki>

export default class AddBeingDeleted extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName(
			`Updating ${model.pageNames.length > 1 ? "templates" : "template"}`,
		);
		this.mergeTargets = [];
		this.mergeTitles = [];
	}

	/**
	 * 
	 * @param {Object} page API page object
	 * @returns {Object|Promise} edit parameters for API.editWithRetry, or promise rejected with an error code 
	 */
	transform(page) {
		if ( this.model.aborted ) {
			return rejection("aborted");
		} else if ( page.missing ) {
			return rejection("doesNotExist");
		}

		const result = this.model.result.getResultsByPage().find(
			result => result.pageName === this.model.discussion.redirects.unresolveOne(docToModule(page.title))
		);
		if ( !result ) {
			return rejection("unexpectedTitle");
		}

		const options = this.model.options.getOptionValues(result && result.selectedResultName);
		if ( !options ) {
			return rejection("couldNotUpdate", "Internal error: could not find options for result");
		}
		
		const holdcellsection = options.holdcellSection || options.holdcellMergeSection;

		// Replace or remove TfD nomination template (which may or may not be noincluded)
		const inclusionTag = isModule(page.title) ? "includeonly" : "noinclude";
		const oldWikitext = page.content;
		try {
			if ( this.mergeTargets.includes(page.title) ) {
				// Is a merge target, so just remove nom template
				return {
					text: this.model.venue.removeNomTemplate(oldWikitext),
					summary: this.model.getEditSummary()
				};
			} else if ( holdcellsection === "ready" ) {
				// Is ready for deletion, so tag for speedy deletion
				return {
					text: `<${inclusionTag}>{{Db-xfd|fullvotepage=${this.model.discussion.discussionPageLink}}}</${inclusionTag}>` +
						this.model.venue.removeNomTemplate(oldWikitext),
					summary: this.model.getEditSummary({short: true, prefix: "[[WP:G6|G6]] Speedy deletion nomination, per"})
				};
			} else {
				// Add Being deleted template, remove nom template
				return {
					text: `<${inclusionTag}>{{Being deleted|${ymdDateString(this.model.discussion.nominationDate)}|${
						encodeForWikilinkFragment(this.model.discussion.sectionHeader) +
						( this.mergeTitles.includes(page.title) ? "|merge=" + result.targetPageName : "" )
					}}}</${inclusionTag}>${this.model.venue.removeNomTemplate(oldWikitext)}`,
					summary: this.model.getEditSummary({short: true,  prefix: "Added {{being deleted}} per"})
				};
			}
		} catch (e) { // Error if multiple nom templates found
			return rejection("couldNotUpdate", e);
		}
	}

	initialise() {
		this.model.setStarted();
		this.model.setTotalSteps(this.model.pageNames.length);
		// Merge targets and pages to be merged (if any)
		const mergePageResults = this.model.getPageResults("merge");
		this.mergeTargets = uniqueArray(mergePageResults.map(pageResult => pageResult.targetPageName));
		this.mergeTitles = this.model.discussion.redirects.resolve(mergePageResults.map(pageResult => pageResult.pageName));
	}

	doTask() {
		this.initialise();
		this.model.setDoing();
		return this.api.editWithRetry(
			this.model.getResolvedPageNames().map(moduleToDoc),
			null,
			page => this.transform(page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch(
			(errortype, code, error) => this.handleOverallError(errortype, code, error)
		);
	}
}
// </nowiki>
