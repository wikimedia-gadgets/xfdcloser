import UnlinkSummaryModel from "./UnlinkSummaryModel";
import UnlinkSummaryController from "./UnlinkSummaryController";
import appConfig from "../../config";
import API from "../../api";
// <nowiki>

function UnlinkSummaryView(config, windowModel) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	UnlinkSummaryView.super.call( this, config );

	this.windowModel = windowModel;
	this.model = new UnlinkSummaryModel({
		advert: appConfig.script.advert,
		api: API
	});

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

	this.controller = new UnlinkSummaryController(this.model, this.windowModel, {
		summaryInput: this.summaryInput,
		summaryPreview: this.summaryPreview,
		summaryInputField: this.summaryInputField,
		summaryPreviewField: this.summaryPreviewField
	});

	this.content = new OO.ui.FieldsetLayout();
	this.content.addItems( [this.summaryInputField, this.summaryPreviewField] );
	this.$element.append(this.content.$element);
}
OO.inheritClass( UnlinkSummaryView, OO.ui.PanelLayout );

export default UnlinkSummaryView;
// </nowiki>