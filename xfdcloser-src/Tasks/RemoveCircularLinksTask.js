import Task from "../Components/Task";
import { rejection } from "../util";
// <nowiki>

function RemoveCircularLinksTask(config) {
	config = {
		label: "Unlinking circular links on redirect target",
		...config
	};
	// Call parent constructor
	RemoveCircularLinksTask.super.call( this, config );
}
OO.inheritClass( RemoveCircularLinksTask, Task );

RemoveCircularLinksTask.prototype.doTask = function() {
	const targets = extraJs.uniqueArray(
		this.pageResults.map(pageResult => pageResult.data.target)
	);
	this.setTotalSteps(targets.length);
	// Only pages which are not targets should be unlinked
	const unlinkPages = this.pageResults
		.map(pageResult => pageResult.page.getPrefixedText())
		.filter(page => !targets.includes(page));

	const transform = page => {
		if (this.aborted) return rejection("Aborted");

		let newWikitext;
		try {
			newWikitext = this.venue.removeNomTemplate(page.content);
		} catch(e){
			// Error if multiple nom templates found
			return rejection("couldNotUpdate", e);
		}
		newWikitext = extraJs.unlink(newWikitext, unlinkPages);
		if ( newWikitext === page.content ) {
			// No links to unlink
			return rejection("noCircularRedirects");
		}
		return {
			text: newWikitext,
			summary: `Unlinking circular redirects: [[${this.discussion.getNomPageLink()}]] closed as ${this.result} ${this.appConfig.script.advert}`
		};
	};

	return 	this.api.editWithRetry(
		targets,
		null,
		page => transform(page),
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title).get(0).outerHTML;
			switch(code) {
			case "noCircularRedirects":
				this.addWarning(
					`Skipped ${titleLink}: none found`
				);
				this.trackStep();
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
				`Could not read contents of redirect ${targets.length > 1 ? "targets" : "targets"}`
			);
			return "Failed";
		}
		// Other errors already handled above, just need to determine task status
		return (this.steps.completed === 0) ? "Failed" : "Done with errors";
	} );
};

export default RemoveCircularLinksTask;
// </nowiki>