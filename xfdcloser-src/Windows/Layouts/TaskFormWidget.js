// <nowiki>
/**
 * @param {Object} config
 * @param {Object} config.formData
 * @param {Object} config.options
 * @param {jQuery} config.$overlay element for overlays
 */
function TaskFormWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	TaskFormWidget.super.call( this, config );

	// TODO: Add task group widget and task widgets
	this.tasksFieldset = new OO.ui.FieldsetLayout({label: "Tasks"});
	this.$element.append(this.tasksFieldset.$element);

	// Simulate tasks being completed: 
	window.setTimeout(
		() => this.setFinished(),
		1100
	);
}
OO.inheritClass( TaskFormWidget, OO.ui.Widget );

TaskFormWidget.prototype.onResize = function() {
	this.emit("resize");
};

TaskFormWidget.prototype.setFinished = function() {
	this.emit("finished");
};

export default TaskFormWidget;
// </nowiki>