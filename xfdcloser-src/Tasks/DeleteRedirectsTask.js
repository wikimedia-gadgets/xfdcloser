import Task from "../Components/Task";
import { multiButtonConfirm, rejection } from "../util";
// <nowiki>

function DeleteRedirectsTask(config) {
	config = {
		label: "Deleting redirects",
		...config
	};
	// Call parent constructor
	DeleteRedirectsTask.super.call( this, config );
}
OO.inheritClass( DeleteRedirectsTask, Task );

DeleteRedirectsTask.prototype.doTask = function() {
	return this.api.queryWithContinue({
		titles: this.pages.map(page => page.getPrefixedText()),
		generator: "redirects",
		grdlimit: "max",
		prop: "info",
		inprop: "talkid"
	}).then(response => {
		if (this.aborted) return rejection("Aborted");

		if ( !response || !response.pages ) {
			this.addWarning("none found");
			return rejection("Skipped.");
		}
		const result = {
			titles: response.pages.map(page => page.title),
			talkTitles: response.pages
				.filter(page => page.talkid)
				.map(page => mw.Title.newFromText(page.title).getTalkPage().getPrefixedText())
		};

		this.setTotalSteps(result.titles.length + result.talkTitles.length);

		if ( result.titles.length < 10 ) {
			return result;
		}

		// Warn since there will be mass actions, allow user to cancel
		return multiButtonConfirm({
			title: "Warning",
			message: `Mass action to be peformed: delete ${result.titles.length} redirects.`,
			actions: [
				{ label:"Cancel", flags:"safe" },
				{ label:"View redirects...", action:"show" },
				{ label:"Delete redirects", action:"accept", flags:"progressive" }
			],
			size: "medium"
		}).then(action => {
			if (action !== "show") { return action; }
			
			return multiButtonConfirm({
				title: "Warning",
				message: `Mass action to be peformed: delete ${result.titles.length} redirects:<ul>${
					result.titles.map(title => `<li>${title}</li>`).join("")
				}</ul>`,
				actions: [
					{ label:"Cancel", flags:"safe" },
					{ label:"Delete redirects", action:"accept", flags:"progressive" }
				],
				size: "medium"
			});
		}).then(action => {
			if (action !== "accept") {
				this.addWarning("Cancelled by user");
				return $.Deferred().reject("Skipped.");
			}
			return result;
		});
	}).then(result => {
		if (this.aborted) return rejection("Aborted");

		const makeReason = type => `[[WP:G8|G8]] (${type}): [[${this.discussion.getNomPageLink()}]] closed as ${this.result} ${this.appConfig.script.advert}`;

		const deleteRedirectsPromise = this.api.deleteWithRetry(
			result.titles,
			{reason: makeReason("redirect")},
			() => { this.trackStep(); },
			(code, error, title) => {
				this.addError(
					`Could not delete redirect ${extraJs.makeLink(title).get(0).outerHTML}`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		); // Errors handled above, no need for a catch block

		const deleteTalkpagesPromise = result.talkTitles.length && this.api.deleteWithRetry(
			result.talkTitles,
			{reason: makeReason("talk page of redirect")},
			() => { this.trackStep(); },
			(code, error, title) => {
				this.addError(
					`Could not delete redirect talk page ${extraJs.makeLink(title).get(0).outerHTML}`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		);

		return $.when(
			// Ensure promises are resolved so that $.when waits for both to complete
			deleteRedirectsPromise.then( () => ({success: true}), () => ({success: false}) ),
			deleteTalkpagesPromise.then( () => ({success: true}), () => ({success: false}) )
		).then((deleteRedirectsResult, deleteTalkpagesResult) => {
			if (!deleteRedirectsResult.success || !deleteTalkpagesResult.success) {
				return rejection();
			}
		});
	}).catch(code => {
		switch(true) {
		case code === "Skipped.":
			return "Skipped.";
		case this.steps.completed === 0:
			return "Failed";
		default:
			return "Done with errors";
		}
	});
};

export default DeleteRedirectsTask;
// </nowiki>