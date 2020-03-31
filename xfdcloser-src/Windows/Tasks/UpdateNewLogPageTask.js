import Task from "../Components/Task";
// <nowiki>

function UpdateNewLogPageTask(config) {
	config = {
		label: "Adding to today's log page",
		...config
	};
	// Call parent constructor
	UpdateNewLogPageTask.super.call( this, config );
}
OO.inheritClass( UpdateNewLogPageTask, Task );

UpdateNewLogPageTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default UpdateNewLogPageTask;
// </nowiki>