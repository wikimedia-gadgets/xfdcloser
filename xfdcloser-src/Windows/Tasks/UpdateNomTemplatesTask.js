import Task from "../Components/Task";
// <nowiki>

function UpdateNomTemplatesTask(config) {
	config = {
		label: `Updating link in nomination ${config.discussion.pages.length > 1 ? "templates" : "template"}`,
		...config
	};
	// Call parent constructor
	UpdateNomTemplatesTask.super.call( this, config );
}
OO.inheritClass( UpdateNomTemplatesTask, Task );

UpdateNomTemplatesTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default UpdateNomTemplatesTask;
// </nowiki>