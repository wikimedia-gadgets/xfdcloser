import { mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { rejection, makeLink } from "../../util";
// <nowiki>

export default class DeleteTalkpages extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName(`Deleting talk ${model.pageNames.length > 1 ? "pages" : "page"}`);
	}

	/**
	 * Verify page existence and speedy deletion eligibility; add a warning if verfication fails
	 * @param {String} pageName
	 * @returns {Boolean} page exists and is eligibile for speedy deletion
	 */
	verifyPage(pageName) {
		const title = mw.Title.newFromText(pageName);
		const isUserTalkBasePage = ( title.getNamespaceId() === 3 ) && ( !pageName.includes("/") );

		if ( !title.exists() ) {
			this.model.addWarning(
				`${makeLink(pageName)} skipped: does not exist (may have already been deleted by others)`
			);
			this.model.trackStep("skipped");
			return false;
		} else if ( isUserTalkBasePage ) {
			this.model.addWarning(
				`${makeLink(pageName)} skipped: base user talk page (not eligible for G8 speedy deletion)`
			);
			this.model.trackStep("skipped");
			return false;
		}
		return true;
	}

	doTask() {
		const talkPages = this.model.getResolvedTalkpagesNames();
		if ( talkPages.length === 0 ) {
			this.model.addWarning("None found");
			return rejection();
		}
		this.model.setTotalSteps(talkPages.length);
		const talkPagesToDelete = talkPages.filter(pageName => this.verifyPage(pageName));

		this.model.setDoing();
		return this.api.deleteWithRetry(
			talkPagesToDelete,
			{ reason: this.model.getEditSummary({prefix: "[[WP:G8|G8]]:"}) },
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title, "delete")
		).catch(
			(errortype, code, error) => { this.handleOverallError(errortype, code, error); }
		);
	}
}
// </nowiki>
