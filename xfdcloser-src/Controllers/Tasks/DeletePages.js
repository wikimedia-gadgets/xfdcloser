import { mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { makeLink, rejection } from "../../util";
// <nowiki>

export default class DeletePages extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName(`Deleting ${model.pageNames.length > 1 ? "pages" : "page"}`);
	}

	/**
	 * Verify page existence; add a warning if a page does not exist
	 * @param {String} pageName
	 * @returns {Boolean} page exists
	 */
	verifyPage(pageName) {
		if ( !mw.Title.newFromText(pageName).exists() ) {
			this.model.addWarning(
				`${makeLink(pageName)} skipped: does not exist (may have already been deleted by others)`
			);
			this.model.trackStep("failed");
			return false;
		}
		return true;
	}

	doTask() {
		this.model.setTotalSteps(this.model.discussion.pages.length);
		this.model.setDoing();
		const pagesToDelete = this.model.getResolvedPageNames()
			.filter(pageName => this.verifyPage(pageName));

		if ( pagesToDelete.length === 0 ) {
			return rejection();
		}

		return this.api.deleteWithRetry(
			pagesToDelete,
			{ reason: this.model.getEditSummary({short: true}) },
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title, "delete")
		).catch(
			(errortype, code, error) => this.handleOverallError(errortype, code, error)
		);
	}
}
// </nowiki>