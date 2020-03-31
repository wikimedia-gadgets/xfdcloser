import Task from "../Components/Task";
// <nowiki>

function RemoveCircularLinksTask(config) {
	config = {
		label: "Unlinking circular links on redirect target",
		...config
	};
	// Call parent constructor
	RemoveCircularLinksTask.super.call( this, config );
}
OO.inheritClass( RemoveCircularLinksTask, Task );

RemoveCircularLinksTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default RemoveCircularLinksTask;
// </nowiki>