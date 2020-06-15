import TaskItemController from "../TaskItemController";
import { rejection } from "../../util";
import config from "../../config";
// <nowiki>

export default class UpdateOldLogPage extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Removing from old log page");
	}

	getParams() {
		const relistInfo = this.model.discussion.relistInfo;
		const title = this.venue.type === "afd" ? relistInfo.oldlogtitle : this.discussion.discussionPageName;

		const params = {
			action: "edit",
			title,
			text: relistInfo.oldLogWikitext,
			summary: this.venue.type === "afd"
				? `Relisting [[:${this.discussion.discussionPageName}]] ${config.script.advert}`
				: `/* ${this.discussion.sectionHeader} */ Relisted on [[:${this.venue.path +
					relistInfo.today}#${this.discussion.sectionHeader}|${relistInfo.today}]] ${config.script.advert}`
		};
		if ( relistInfo.oldLogTimestamps ) {
			params.basetimestamp = relistInfo.oldLogTimestamps.base;
			params.starttimestamp = relistInfo.oldLogTimestamps.start;
		}
		if ( this.venue.type !== "afd" ) {
			params.section = this.discussion.sectionNumber;
		}
		return params;
	}

	doTask() {
		if ( this.aborted ) return rejection("aborted");

		this.model.setTotalSteps(1);
		if ( this.venue.type === "afd" && !this.model.discussion.relistInfo.oldlogTransclusion ) {
			this.model.addError("Transclusion not found on old log page; could not be commented out");
			this.model.trackStep("failed");
			return rejection();
		}

		this.model.setDoing();
		const params = this.getParams();
		return this.api.postWithToken("csrf", params).then(
			() => this.model.trackStep(),
			(code, error) => {
				this.handlePageError(code, error, params.title);
				return rejection();
			}
		);
	}
}
// </nowiki>