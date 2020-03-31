import Task from "../Components/Task";
// <nowiki>

function UpdateDiscussionTask(config) {
	config = {
		label: "Updating discussion",
		...config
	};
	// Call parent constructor
	UpdateDiscussionTask.super.call( this, config );
}
OO.inheritClass( UpdateDiscussionTask, Task );

UpdateDiscussionTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default UpdateDiscussionTask;
// </nowiki>