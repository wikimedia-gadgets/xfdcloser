import { OO } from "../../globals";
import UnlinkSummaryController from "../Controllers/UnlinkSummaryPanelController";
// <nowiki>

function UnlinkSummaryPanel(config, model) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	UnlinkSummaryPanel.super.call( this, config );

	this.model = model;

	this.summaryInput = new OO.ui.TextInputWidget();
	this.summaryPreview = new OO.ui.LabelWidget({classes: ["xu-preview"]});
	this.summaryInputField = new OO.ui.FieldLayout( this.summaryInput, { 
		label: "Enter the reason for link removal", 
		align: "top" 
	} );
	this.summaryPreviewField = new OO.ui.FieldLayout( this.summaryPreview, { 
		label: "Edit summary preview:", 
		align: "top" 
	} );

	this.controller = new UnlinkSummaryController(this.model, this);

	this.content = new OO.ui.FieldsetLayout();
	this.content.addItems( [this.summaryInputField, this.summaryPreviewField] );
	this.$element.append(this.content.$element);
}
OO.inheritClass( UnlinkSummaryPanel, OO.ui.PanelLayout );

export default UnlinkSummaryPanel;
// </nowiki>