import Task from "../Components/Task";
// <nowiki>

function AddBeingDeletedTask(config) {
	config = {
		label: `Updating ${config.pages.length > 1 ? "templates" : "template"}`,
		...config
	};
	// Call parent constructor
	AddBeingDeletedTask.super.call( this, config );
}
OO.inheritClass( AddBeingDeletedTask, Task );

AddBeingDeletedTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default AddBeingDeletedTask;
// </nowiki>