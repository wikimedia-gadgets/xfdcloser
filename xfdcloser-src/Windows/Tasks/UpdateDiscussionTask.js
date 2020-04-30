import Task from "../Components/Task";
// <nowiki>

function UpdateDiscussionTask(config, relistInfoPromise) {
	config = {
		label: "Updating discussion",
		...config
	};
	// Call parent constructor
	UpdateDiscussionTask.super.call( this, config );

	this.relistInfoPromise = relistInfoPromise;
}
OO.inheritClass( UpdateDiscussionTask, Task );

UpdateDiscussionTask.prototype.doTask = function() {
	this.setTotalSteps(1);
	return this.relistInfoPromise.then(relistInfo => {
		const params = {
			action: "edit",
			title: this.discussion.nomPage,
			text: relistInfo.newWikitext,
			summary: `Relisting discussion ${this.appConfig.script.advert}`,
			// Protect against errors and conflicts
			assert: "user",
			basetimestamp: relistInfo.nomPageTimestamps.base,
			starttimestamp: relistInfo.nomPageTimestamps.start
		};
		if ( this.venue.type === "mfd" ) {
			params.section = self.discussion.sectionNumber;
		}

		return this.api.postWithToken("csrf", params).then(
			() => { this.trackStep(); },
			(code, error) => {
				this.addError(
					`Could not edit ${this.venue.type.toUpperCase()} discussion`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		);
	});
};

export default UpdateDiscussionTask;
// </nowiki>