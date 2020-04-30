import Task from "../Components/Task";
// <nowiki>

function UpdateOldLogPageTask(config, relistInfoPromise) {
	config = {
		label: "Removing from old log page",
		...config
	};
	// Call parent constructor
	UpdateOldLogPageTask.super.call( this, config );

	this.relistInfoPromise = relistInfoPromise;
}
OO.inheritClass( UpdateOldLogPageTask, Task );

UpdateOldLogPageTask.prototype.doTask = function() {
	this.setTotalSteps(1);
	return this.relistInfoPromise.then(relistInfo => {
		const params = {
			action: "edit",
			title: this.venue.type === "afd" ? relistInfo.oldlogtitle : this.discussion.nomPage,
			text: relistInfo.oldLogWikitext,
			summary: this.venue.type === "afd"
				? `Relisting [[:${this.discussion.nomPage}]] ${this.appConfig.script.advert}`
				: `/* ${this.discussion.sectionHeader} */ Relisted on [[:${this.venue.path +
					relistInfo.today}#${this.discussion.sectionHeader}|${relistInfo.today}]] ${this.appConfig.script.advert}`
		};
		if (relistInfo.oldLogTimestamps) {
			params.basetimestamp = relistInfo.oldLogTimestamps.base;
			params.starttimestamp = relistInfo.oldLogTimestamps.start;
		}
		
		if ( this.venue.type === "afd" ) {
			if ( !relistInfo.oldlogTransclusion ) {
				this.addError("Transclusion not found on old log page; could not be commented out");
				this.trackStep({failed: true});
				return;
			}
		} else {
			params.section = this.discussion.sectionNumber;
		}

		return this.api.postWithToken("csrf", params).then(
			() => { this.trackStep(); },
			(code, error) => {
				this.addError(
					`Could not edit ${this.venue.type.toUpperCase()} log page`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		);
	});
};

export default UpdateOldLogPageTask;
// </nowiki>