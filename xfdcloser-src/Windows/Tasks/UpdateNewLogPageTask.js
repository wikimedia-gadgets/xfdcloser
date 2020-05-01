import Task from "../Components/Task";
import { rejection } from "../../util";
// <nowiki>

function UpdateNewLogPageTask(config, relistInfoPromise) {
	config = {
		label: "Adding to today's log page",
		...config
	};
	// Call parent constructor
	UpdateNewLogPageTask.super.call( this, config );

	this.relistInfoPromise = relistInfoPromise;
}
OO.inheritClass( UpdateNewLogPageTask, Task );

UpdateNewLogPageTask.prototype.doTask = function() {
	this.setTotalSteps(1);
	return this.relistInfoPromise.then(relistInfo => {
		if (this.aborted) return rejection("Aborted");

		const params = {
			action: "edit",
			title: this.venue.path + relistInfo.today,
			summary: `Relisting ${this.venue.type === "afd"
				? `[[:${this.discussion.nomPage}]]`
				: `"${this.discussion.sectionHeader}"`
			} ${this.appConfig.script.advert}`
		};
		params[relistInfo.newLogEditType] = this.venue.type === "afd"
			? relistInfo.newLogWikitext
			: (relistInfo.newLogEditType === "appendtext" ? "\n" : "") + relistInfo.newWikitext;
		if (relistInfo.newLogTimestamps) {
			params.basetimestamp = relistInfo.newLogTimestamps.base;
			params.starttimestamp = relistInfo.newLogTimestamps.start;
		}
		if ( /(tfd|rfd|cfd)/.test(this.venue.type) ) {
			params.section = relistInfo.newLogSection;
		}
		return this.api.postWithToken("csrf", params).then(
			() => { this.trackStep(); },
			(code, error) => {
				this.addError(
					`Could not edit today's ${this.venue.type.toUpperCase()} log page`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		);
	});
};

export default UpdateNewLogPageTask;
// </nowiki>