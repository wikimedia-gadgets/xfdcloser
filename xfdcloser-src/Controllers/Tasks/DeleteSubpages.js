import { $, mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { multiButtonConfirm, rejection } from "../../util";
// <nowiki>

export default class DeleteSubpages extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Deleting subpages");
	}

	/**
	 * 
	 * @param {Object[]} pages page objects from Api
	 * @returns {Object<string,string[]>|Promise<Object<string,string[]>>} Object (or promise of object) of page name arrays for keys "titles" and "talkTitles" 
	 */
	titlesFromResponsePages(resultList) {
		let result = {
			titles: [],
			talkTitles: []
		};

		for(let i = 0; i < resultList.length; i++){
			if(resultList[i] != undefined){
				result.titles.push(resultList[i].pages.map(page => page.title));
				result.talkTitles.push(resultList[i].pages
					.filter(page => page.talkid)
					.map(page => mw.Title.newFromText(page.title).getTalkPage().getPrefixedText()));
			}
		}
		result.talkTitles = result.talkTitles.flat();

		this.model.setTotalSteps(result.titles.length + result.talkTitles.length);

		if ( result.titles.length < 5 ) {
			return result;
		}

		// Warn since there will be mass actions, allow user to cancel
		return multiButtonConfirm({
			title: "Warning",
			message: `Mass action to be peformed: delete ${result.titles.length} subpages.`,
			actions: [
				{ label:"Cancel", flags:"safe" },
				{ label:"View subpages...", action:"show" },
				{ label:"Delete subpages", action:"accept", flags:"progressive" }
			],
			size: "medium",
			scrolled: true
		}).then(action => {
			if (action !== "show") { return action; }
			
			return multiButtonConfirm({
				title: "Warning",
				message: `Mass action to be peformed: delete ${result.titles.length} subpages:<ul>${
					result.titles.map(title => `<li>${title}</li>`).join("")
				}</ul>`,
				actions: [
					{ label:"Cancel", flags:"safe" },
					{ label:"Delete subpages", action:"accept", flags:"progressive" }
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
		return Promise.all(this.model.getResolvedPageNames().map(page => this.api.queryWithContinue({
			gapprefix: mw.Title.newFromText(page).getMainText()+"/",
			gapnamespace: mw.Title.newFromText(page).getNamespaceId(),
			generator: "allpages",
			gaplimit: "max",
			prop: "info",
			inprop: "talkid"
		}))).then(responses => {
			if ( this.model.aborted ) {
				return rejection("aborted");
			} else if ( !responses ) {
				this.model.addWarning("none found");
				return rejection("Skipped.");
			}
			return this.titlesFromResponsePages(responses);
		}).then(result => {
			if ( result.titles.length == 0 ) {
				this.model.addWarning("none found");
				return rejection("Skipped.");
			}
			if ( this.model.aborted ) {
				return rejection("aborted");
			}
			this.model.setDoing();
			const deleteSubpagesPromise = this.api.deleteWithRetry(
				result.titles,
				{ reason: this.model.getEditSummary({prefix: "[[WP:G8|G8]] (subpage):"}) },
				() => this.model.trackStep(),
				(code, error, title) => this.handlePageError(code, error, title, "delete")
			).catch(
				(errortype, code, error) => { this.handleOverallError(errortype, code, error); }
			);
			const deleteTalkpagesPromise = result.talkTitles.length && this.api.deleteWithRetry(
				result.talkTitles,
				{ reason: this.model.getEditSummary({prefix: "[[WP:G8|G8]] (talk page of subpage):"}) },
				() => this.model.trackStep(),
				(code, error, title) => this.handlePageError(code, error, title, "delete")
			).catch(
				(errortype, code, error) => { this.handleOverallError(errortype, code, error); }
			);
			return $.when(deleteSubpagesPromise, deleteTalkpagesPromise);
		});
	}
}
// </nowiki>
