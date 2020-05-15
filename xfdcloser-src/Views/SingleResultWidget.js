import { mw, OO } from "../../globals";
import SingleResultWidgetController from "../Controllers/SingleResultWidgetController";
// <nowiki>

/**
 * 
 * @param {ResultItem} model
 * @param {Object} config
 * @param {JQuery} config.$overlay
 */
function SingleResultWidget(model, config) {
	config = config || {};
	// Call parent constructor
	SingleResultWidget.super.call(this, config);

	this.$overlay = config.$overlay;

	this.model = model;

	this.buttonSelect = new OO.ui.ButtonSelectWidget();
	this.speedyOption = new OO.ui.CheckboxMultioptionWidget( {
		data: {name:"speedy", prefix: "speedy "},
		label: "Speedy"
	} );
	this.softOption = new OO.ui.CheckboxMultioptionWidget( {
		data: {name:"soft", prefix: "soft "},
		label: "Soft"
	} );
	this.deleteFirstOption = new OO.ui.CheckboxMultioptionWidget( {
		data: {name:"deleteFirst", prefix: "delete and "},
		label: "Delete first"
	} );
	this.optionsMultiselect = new OO.ui.CheckboxMultiselectWidget( {
		items: [
			this.speedyOption,
			this.softOption,
			this.deleteFirstOption
		]
	} );
	this.optionsMultiselect.$element.find("label").css({
		"display":"inline-block",
		"margin-left":"1em",
		"padding":"4px 0"
	});
	this.targetInput = new OO.ui.TextInputWidget( {
		label: "to:",
		labelPosition: "before",
		classes: ["padLeft2em"],
		validate: function(val) {
			return mw.Title.newFromText(val) !== null;
		}
	} );
	this.customResultInput = new OO.ui.TextInputWidget( {
		label: "Result:",
		labelPosition: "before",
		classes: ["padLeft4em"],
		validate: "non-empty"
	} );
	this.$element.append(
		this.buttonSelect.$element,
		this.optionsMultiselect.$element,
		this.targetInput.$element,
		this.customResultInput.$element
	);

	this.controller = new SingleResultWidgetController(this.model, this);
	this.controller.updateFromModel();
}
OO.inheritClass( SingleResultWidget, OO.ui.Widget );

export default SingleResultWidget;
// </nowiki>