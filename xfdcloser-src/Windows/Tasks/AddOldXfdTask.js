import Task from "../Components/Task";
// <nowiki>

function AddOldXfdTask(config) {
	config = {
		label: `Updating talk ${config.pages.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	AddOldXfdTask.super.call( this, config );
}
OO.inheritClass( AddOldXfdTask, Task );

AddOldXfdTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default AddOldXfdTask;
// </nowiki>