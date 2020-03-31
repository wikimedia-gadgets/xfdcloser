import Task from "../Components/Task";
// <nowiki>

function AddMergeTemplatesTask(config) {
	config = {
		label: `Updating ${config.pages.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	AddMergeTemplatesTask.super.call( this, config );
}
OO.inheritClass( AddMergeTemplatesTask, Task );

AddMergeTemplatesTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default AddMergeTemplatesTask;
// </nowiki>