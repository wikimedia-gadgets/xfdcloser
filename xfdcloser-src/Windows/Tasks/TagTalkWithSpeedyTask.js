import Task from "../Components/Task";
// <nowiki>

function TagTalkWithSpeedyTask(config) {
	config = {
		label: `Tagging talk ${config.pages.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	TagTalkWithSpeedyTask.super.call( this, config );
}
OO.inheritClass( TagTalkWithSpeedyTask, Task );

TagTalkWithSpeedyTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default TagTalkWithSpeedyTask;
// </nowiki>