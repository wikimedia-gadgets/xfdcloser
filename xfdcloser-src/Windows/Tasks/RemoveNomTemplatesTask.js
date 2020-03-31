import Task from "../Components/Task";
// <nowiki>

function RemoveNomTemplatesTask(config) {
	config = {
		label: `Updating ${config.pages.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	RemoveNomTemplatesTask.super.call( this, config );
}
OO.inheritClass( RemoveNomTemplatesTask, Task );

RemoveNomTemplatesTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default RemoveNomTemplatesTask;
// </nowiki>