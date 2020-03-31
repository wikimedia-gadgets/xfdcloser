import Task from "../Components/Task";
// <nowiki>

function DisambiguateTask(config) {
	config = {
		label: `Updating ${config.pages.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	DisambiguateTask.super.call( this, config );
}
OO.inheritClass( DisambiguateTask, Task );

DisambiguateTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default DisambiguateTask;
// </nowiki>