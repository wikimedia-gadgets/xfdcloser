import TaskItemController from "../TaskItemController";
import { rejection } from "../../util";
import config from "../../config";
// <nowiki>

export default class UpdateNewLogPage extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Adding to today's log page");
	}

	getParams() {
		const relistInfo = this.model.discussion.relistInfo;
		const title = this.model.venue.path + relistInfo.today;

		const params = {
			action: "edit",
			title,
			summary: `Relisting ${this.model.venue.type === "afd"
				? `[[:${this.model.discussion.discussionPageName}]]`
				: `"${this.model.discussion.sectionHeader}"`
			} ${config.script.advert}`,
		};
		params[relistInfo.newLogEditType] = this.model.venue.type === "afd"
			? relistInfo.newLogWikitext
			: (relistInfo.newLogEditType === "appendtext" ? "\n" : "") + relistInfo.newWikitext;
		if ( relistInfo.newLogTimestamps ) {
			params.basetimestamp = relistInfo.newLogTimestamps.base;
			params.starttimestamp = relistInfo.newLogTimestamps.start;
		}
		if ( /(tfd|rfd|cfd)/.test(this.model.venue.type) ) {
			params.section = relistInfo.newLogSection;
		}
		return params;
	}

	doTask() {
		if ( this.aborted ) return rejection("aborted");

		this.model.setTotalSteps(1);
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
