import Task from "../Components/Task";
// <nowiki>

function GetRelistInfoTask(config) {
	config = {
		label: "Preparing to relist",
		...config
	};
	// Call parent constructor
	GetRelistInfoTask.super.call( this, config );
}
OO.inheritClass( GetRelistInfoTask, Task );

GetRelistInfoTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default GetRelistInfoTask;
// </nowiki>