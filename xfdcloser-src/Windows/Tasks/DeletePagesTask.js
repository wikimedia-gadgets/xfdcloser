import Task from "../Components/Task";
// <nowiki>

function DeletePagesTask(config) {
	config = {
		label: `Deleting ${config.pages.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	DeletePagesTask.super.call( this, config );
}
OO.inheritClass( DeletePagesTask, Task );

DeletePagesTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default DeletePagesTask;
// </nowiki>