import { OO } from "../../globals";
import ResultItemController from "../Controllers/ResultItemController";
// <nowiki>

/**
 * 
 * @param {ResultItem} model
 */
function ResultItemWidget(model, config) {
	config = config || {};
	// Call parent constructor
	ResultItemWidget.super.call(this, config);

	this.$overlay = config.$overlay;

	this.model = model;

	this.pageName = config.pageName;

	this.resultDropdown = new OO.ui.DropdownWidget({
		$overlay: this.$overlay
	});
	this.resultField = new OO.ui.FieldLayout(this.resultDropdown);

	this.targetInput = new OO.ui.TextInputWidget({validate: config.validatePageName});
	this.targetField = new OO.ui.FieldLayout( this.targetInput, {
		label: "to:",
		align: "right"
	} );
	this.targetField.$element.css({margin: "6px 0 12px 0"});

	this.customResultInput = new OO.ui.TextInputWidget({validate: config.validateCustomResult});
	this.customField = new OO.ui.FieldLayout( this.customResultInput, {
		label: "Result:",
		align: "right"
	} );
	this.customField.$element.css({margin: "6px 0"});

	this.fieldset = new OO.ui.FieldsetLayout( {
		items: [
			this.resultField,
			this.targetField,
			this.customField
		]
	});
	//this.$element.css({"margin-bottom":"6px"}).append(this.fieldset.$element);

	this.$element.append(this.fieldset.$element).css({"margin-bottom": "1.8em"});

	this.controller = new ResultItemController(this.model, this);
	this.controller.updateFromModel();
}
OO.inheritClass( ResultItemWidget, OO.ui.Widget );

ResultItemWidget.prototype.getInputStates = function() {
	const targetInputCarets = this.targetInput.$input.textSelection("getCaretPosition", {startAndEnd: true});
	const customResultCarets = this.customResultInput.$input.textSelection("getCaretPosition", {startAndEnd: true});
	return {
		targetInput: {
			focused: this.targetInput.$input.get(0) === document.activeElement,
			caretStart: targetInputCarets[0],
			caretEnd: targetInputCarets[1]
		},
		customResultInput: {
			focused: this.customResultInput.$input.get(0) === document.activeElement,
			caretStart: customResultCarets[0],
			caretEnd: customResultCarets[1]
		}
	};
};

ResultItemWidget.prototype.setInputStates = function(state) {
	if ( state.targetInput.focused ) {
		this.targetInput.focus();
		this.targetInput.$input.textSelection("setSelection", {
			start: state.targetInput.caretStart,
			end: state.targetInput.caretEnd,
		});
	} else if ( state.customResultInput.focused ) {
		this.customResultInput.focus();
		this.customResultInput.$input.textSelection("setSelection", {
			start: state.customResultInput.caretStart,
			end: state.customResultInput.caretEnd,
		});
	}
};

export default ResultItemWidget;
// </nowiki>