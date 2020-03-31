import Task from "../Components/Task";
// <nowiki>

function DeleteRedirectsTask(config) {
	config = {
		label: "Deleting redirects",
		...config
	};
	// Call parent constructor
	DeleteRedirectsTask.super.call( this, config );
}
OO.inheritClass( DeleteRedirectsTask, Task );

DeleteRedirectsTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default DeleteRedirectsTask;
// </nowiki>