import Task from "../Components/Task";
import { rejection } from "../../util";
// <nowiki>

function RemoveNomTemplatesTask(config) {
	config = {
		label: `Updating ${config.pageResults.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	RemoveNomTemplatesTask.super.call( this, config );
}
OO.inheritClass( RemoveNomTemplatesTask, Task );

const _transform = function(page, replacement) {
	if (this.aborted) return rejection("Aborted");

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
	
	// Start building updated wikitext
	let updatedWikitext = replacement || "";
	
	if ( this.venue.hasNomTemplate(oldWikitext) ) {
		try {
			// Remove nom template
			updatedWikitext += this.venue.removeNomTemplate(oldWikitext);
		} catch(e){
			// Error if multiple nom templates found
			return $.Deferred().reject("couldNotUpdate", e);
		}
	} else if ( !updatedWikitext ) {
		// Skip - nothing to change
		return $.Deferred().reject("nominationTemplateNotFound");
	} else {
		// Show warning
		this.addWarning(
			`Nomination template not found on page ${extraJs.makeLink(page.title).get(0).outerHTML}`
		);
		// Keep going - can still prepend replacement wikitext
		updatedWikitext += oldWikitext;
	}
	return {
		text: updatedWikitext,
		summary: `${this.venue.type.toUpperCase()} closed as ${this.result} ${this.appConfig.script.advert}`
	};
};

RemoveNomTemplatesTask.prototype.doTask = function() {
	const pageTitles = this.discussion.getPageTitles(this.pages, {"moduledocs": true});
	if ( pageTitles.length === 0 ) {
		this.addWarning("None found");
		return rejection("Failed");
	}
	this.setTotalSteps(pageTitles.length);

	const transform = _transform.bind(this);

	return 	this.api.editWithRetry(
		pageTitles,
		null,
		page => transform(page),
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title).get(0).outerHTML;
			switch(code) {
			case "Unexpected title":
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
			case "nominationTemplateNotFound":
				this.addError(
					`Nomination template not found on page ${titleLink}`
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
				`Could not read contents of nominated ${pageTitles.length > 1 ? "pages" : "page"}`
			);
			return "Failed";
		}
		// Other errors already handled above, just need to determine task status
		return (this.steps.completed === 0) ? "Failed" : "Done with errors";
	} );
};

export default RemoveNomTemplatesTask;
export {_transform as replaceNomTransform};
// </nowiki>