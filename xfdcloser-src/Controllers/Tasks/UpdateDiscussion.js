import TaskItemController from "../TaskItemController";
import { rejection } from "../../util";
import config from "../../config";
// <nowiki>

export default class UpdateDiscussion extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Updating discussion");
	}

	getParams() {
		const { discussionPageTimestamps, newWikitext } = this.model.discussion.relistInfo;
		const params = {
			action: "edit",
			title: this.model.discussion.discussionPageName,
			text: newWikitext,
			summary: `Relisting discussion ${config.script.advert}`,
			// Protect against errors and conflicts
			assert: "user",
			basetimestamp: discussionPageTimestamps.base,
			starttimestamp: discussionPageTimestamps.start
		};
		if ( this.model.venue.type === "mfd" ) {
			params.section = this.model.discussion.sectionNumber;
		}
		return params;
	}

	doTask() {
		if ( this.aborted ) return rejection("aborted");

		this.model.setTotalSteps(1);
		this.model.setDoing();
		return this.api.postWithToken("csrf", this.getParams()).then(
			() => this.model.trackStep(),
			(code, error) => {
				this.handlePageError(code, error, this.model.discussion.discussionPageName);
				return rejection();
			}
		);
	}
}
// </nowiki>
