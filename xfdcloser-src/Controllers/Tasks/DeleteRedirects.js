import { $, mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { multiButtonConfirm, rejection } from "../../util";
// <nowiki>

export default class DeleteRedirects extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Deleting redirects");
	}

	/**
	 * 
	 * @param {Object[]} pages page objects from Api
	 * @returns {Object<string,string[]>|Promise<Object<string,string[]>>} Object (or promise of object) of page name arrays for keys "titles" and "talkTitles" 
	 */
	titlesFromResponsePages(pages) {
		const result = {
			titles: pages.map(page => page.title),
			talkTitles: pages
				.filter(page => page.talkid)
				.map(page => mw.Title.newFromText(page.title).getTalkPage().getPrefixedText())
		};

		this.model.setTotalSteps(result.titles.length + result.talkTitles.length);

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
			size: "medium",
			scrolled: true
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
				size: "medium",
				scrolled: true
			});
		}).then(action => {
			if (action !== "accept") {
				this.model.addWarning("Cancelled by user");
				return $.Deferred().reject("Skipped.");
			}
			return result;
		});
	}

	doTask() {
		return this.api.queryWithContinue({
			titles: this.model.getResolvedPageNames(),
			generator: "redirects",
			grdlimit: "max",
			prop: "info",
			inprop: "talkid"
		}).then(response => {
			if ( this.model.aborted ) {
				return rejection("aborted");
			} else if ( !response || !response.pages ) {
				this.model.addWarning("none found");
				return rejection("Skipped.");
			}
			return this.titlesFromResponsePages(response.pages);
		}).then(result => {
			if ( this.model.aborted ) {
				return rejection("aborted");
			}
			this.model.setDoing();
			const deleteRedirectsPromise = this.api.deleteWithRetry(
				result.titles,
				{ reason: this.model.getEditSummary({prefix: "[[WP:G8|G8]] (redirect):"}) },
				() => this.model.trackStep(),
				(code, error, title) => this.handlePageError(code, error, title, "delete")
			).catch(
				(errortype, code, error) => { this.handleOverallError(errortype, code, error); }
			);
			const deleteTalkpagesPromise = result.talkTitles.length && this.api.deleteWithRetry(
				result.talkTitles,
				{ reason: this.model.getEditSummary({prefix: "[[WP:G8|G8]] (talk page of redirect):"}) },
				() => this.model.trackStep(),
				(code, error, title) => this.handlePageError(code, error, title, "delete")
			).catch(
				(errortype, code, error) => { this.handleOverallError(errortype, code, error); }
			);
			return $.when(deleteRedirectsPromise, deleteTalkpagesPromise);
		});
	}
}
// </nowiki>
