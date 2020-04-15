import Task from "../Components/Task";
// <nowiki>

function UnlinkBacklinksTask(config) {
	config = {
		label: "Unlinking backlinks",
		...config
	};
	// Call parent constructor
	UnlinkBacklinksTask.super.call( this, config );

	this.finishedReadingApi = $.Deferred();
}
OO.inheritClass( UnlinkBacklinksTask, Task );

UnlinkBacklinksTask.prototype.doTask = function() {
	this.finishedReadingApi.resolve("simulated");
	return $.Deferred().resolve("simulated");
};

export default UnlinkBacklinksTask;
// </nowiki>