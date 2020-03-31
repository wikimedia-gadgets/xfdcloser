import Task from "../Components/Task";
// <nowiki>

function AddToHoldingCellTask(config) {
	config = {
		label: "Listing at holding cell",
		...config
	};
	// Call parent constructor
	AddToHoldingCellTask.super.call( this, config );
}
OO.inheritClass( AddToHoldingCellTask, Task );

AddToHoldingCellTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default AddToHoldingCellTask;
// </nowiki>