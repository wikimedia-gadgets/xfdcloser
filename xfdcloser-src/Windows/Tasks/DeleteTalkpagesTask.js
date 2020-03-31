import Task from "../Components/Task";
// <nowiki>

function DeleteTalkpagesTask(config) {
	config = {
		label: `Deleting talk ${config.pages.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	DeleteTalkpagesTask.super.call( this, config );
}
OO.inheritClass( DeleteTalkpagesTask, Task );

DeleteTalkpagesTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default DeleteTalkpagesTask;
// </nowiki>