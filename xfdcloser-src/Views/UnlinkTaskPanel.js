import { OO } from "../../globals";
import TaskItemWidget from "./TaskItemWidget";
// <nowiki>

function UnlinkTaskPanel(config, model) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	UnlinkTaskPanel.super.call( this, config );

	this.model = model;

	this.taskWidget = new TaskItemWidget(this.model);
	this.fieldset = new OO.ui.FieldsetLayout({
		items: [this.taskWidget]
	});
	this.$element.append(this.fieldset.$element);
}
OO.inheritClass( UnlinkTaskPanel, OO.ui.PanelLayout );

export default UnlinkTaskPanel;
// </nowiki>