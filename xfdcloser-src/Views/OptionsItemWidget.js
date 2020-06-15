import { OO } from "../../globals";
import OptionsItemController from "../Controllers/OptionsItemController";
// <nowiki>

/**
 * 
 * @param {OptionsItem} model
 */
function OptionsItemWidget(model, config) {
	config = config || {};
	// Call parent constructor
	OptionsItemWidget.super.call(this, config);
	this.$overlay = config.$overlay;

	this.model = model;

	this.fieldset = new OO.ui.FieldsetLayout();

	this.actionsDropdown = new OO.ui.DropdownWidget( {
		$overlay: this.$overlay
	} );

	this.fieldset.addItems( [
		new OO.ui.FieldLayout( this.actionsDropdown, {
			label: "Actions"
		} ),
	] );

	this.controller = new OptionsItemController(this.model, this);
	this.controller.updateFromModel();

	this.$element.append(this.fieldset.$element).css({"margin-bottom": "1.8em"});

	this.setData({name: this.model.name});
}
OO.inheritClass( OptionsItemWidget, OO.ui.Widget );

export default OptionsItemWidget;
// </nowiki>