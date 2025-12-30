import { $, mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { rejection, makeLink } from "../../util";
// <nowiki>

export default class TagTalkWithSpeedy extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName(`Tagging talk ${model.pageNames.length > 1 ? "pages" : "page"}`);
	}

	verifyPage(pageName) {
		const title = mw.Title.newFromText(pageName);
		const isUserTalkBasePage = title.getNamespaceId() === 3 && !pageName.includes("/");
		if ( !title.exists() ) {
			this.model.addWarning(
				`${makeLink(pageName)} skipped: does not exist (may have already been deleted by others)`
			);
			this.model.trackStep("skipped");
			return false;
		}
		if ( isUserTalkBasePage ) {
			this.model.addWarning(
				`${makeLink(pageName)} skipped: base user talk page (not eligible for G8 speedy deletion)`
			);
			this.model.trackStep("skipped");
			return false;
		}
		return true;
	}

	transform(/* page */) {
		if ( this.aborted ) return rejection("aborted");
		return {
			prependtext: "{{Db-talk}}\n",
			summary: this.model.getEditSummary({short:true, prefix: "[[WP:G8|G8]] Speedy deletion nomination, per"}),
			nocreate: 1
		};
	}

	doTask() {
		const talkPages = this.model.getResolvedTalkpagesNames();
		if ( talkPages.length === 0 ) {
			this.model.addWarning("None found");
			return rejection();
		}
		this.model.setTotalSteps(talkPages.length);

		const talkPagesToTag = talkPages.filter(talkPage => this.verifyPage(talkPage));
		if ( talkPagesToTag.length === 0 ) {
			return $.Deferred().resolve("Skipped");
		}
		this.model.setDoing();
		return this.api.editWithRetry(
			talkPagesToTag,
			null,
			(page) => this.transform(page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch(
			(errortype, code, error) => this.handleOverallError(errortype, code, error)
		);
	}
}
// </nowiki>
