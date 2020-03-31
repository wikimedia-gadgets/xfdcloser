import Task from "../Components/Task";
// <nowiki>

function UpdateOldLogPageTask(config) {
	config = {
		label: "Removing from old log page",
		...config
	};
	// Call parent constructor
	UpdateOldLogPageTask.super.call( this, config );
}
OO.inheritClass( UpdateOldLogPageTask, Task );

UpdateOldLogPageTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default UpdateOldLogPageTask;
// </nowiki>