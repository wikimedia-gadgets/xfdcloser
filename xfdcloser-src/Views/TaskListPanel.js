import { OO } from "../../globals";
import TaskListPanelController from "../Controllers/TaskListPanelController";
// <nowiki>

function TaskListPanel( config, model ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	TaskListPanel.super.call( this, config );

	this.model = model;

	this.fieldset = new OO.ui.FieldsetLayout({label: "Tasks"});
	this.$element.append(this.fieldset.$element);

	this.controller = new TaskListPanelController(this.model, this);
}
OO.inheritClass( TaskListPanel, OO.ui.PanelLayout );

export default TaskListPanel;
// </nowiki>
