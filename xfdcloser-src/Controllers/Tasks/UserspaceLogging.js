import rejection from "../../util";
import { mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import Month from "../../Month";
// <nowiki>

export default class UserspaceLogging extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Updating userspace log");
	}

	transform(page) {
		let newText = page.content;
		const date = new Date();
		if (newText == undefined) {
			newText = "This is a log of all XfD closes made by this user using [[WP:XFDcloser|XFDcloser]].\n\n" +
				"If you no longer wish to keep this log, you can turn it off using the preferences panel and " +
				"nominate this page for speedy deletion under [[WP:CSD#U1|CSD U1]]."; 
		}
		const monthHeader = "=== " + Month.nameFromIndex(date.getUTCMonth()) +" "+  date.getUTCFullYear() + " ===";
		if (!newText.includes(monthHeader)){
			newText += "\n\n" + monthHeader + "\n";
		}

		let logItem = "";
		if (this.model.venue.hasIndividualSubpages){
			logItem = "Closed [[" + this.model.discussion.discussionPageName + "]] as " + this.model.result.getResultText(); 
		} else {
			logItem = "Closed [[" + this.model.discussion.discussionPageName + "#" + this.model.discussion.sectionHeader + "]] as " + this.model.result.getResultText(); 
		}
		newText += "\n#"+logItem+" ~~~~~";
		return {
			text: newText,
			summary: logItem
		};
	}

	doTask() {
		this.model.setTotalSteps(1);
		this.model.setDoing();
		const logPage = "User:"+mw.user.getName()+"/XFDcloser log";

		return this.api.editWithRetry(
			logPage,
			{},
			page => this.transform(page),
			() => this.model.trackStep(),
			(code, error, title) => {
				this.handlePageError("abort");
				if ( code !== "abort" && code !== "aborted" ) {
					this.handlePageError(code, error, title);
				}
			}
		).catch((errortype, code, error) => {
			this.model.setAborted();
			this.handleOverallError(errortype, code, error);
			return rejection();
		});
	}
}
// </nowiki>
