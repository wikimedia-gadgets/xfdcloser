import Task from "../Components/Task";
// <nowiki>

function UnlinkBacklinksTask(config) {
	config = {
		label: "Unlinking backlinks",
		...config
	};
	// Call parent constructor
	UnlinkBacklinksTask.super.call( this, config );
}
OO.inheritClass( UnlinkBacklinksTask, Task );

UnlinkBacklinksTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default UnlinkBacklinksTask;
// </nowiki>