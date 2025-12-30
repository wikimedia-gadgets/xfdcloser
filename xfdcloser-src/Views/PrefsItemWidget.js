import { OO } from "../../globals";
import PrefsItemController from "../Controllers/PrefsItemController";
// <nowiki>

function PrefsItemWidget( model, config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	PrefsItemWidget.super.call( this, config );
	this.$overlay = config.$overlay;

	this.model = model;

	switch(model.type) {
	case "toggle":
		this.selector = new OO.ui.ToggleSwitchWidget(); break;
	case "dropdown":
		this.selector = new OO.ui.DropdownWidget({
			$overlay: this.$overlay,
			menu: {
				items: model.options.map(option => new OO.ui.MenuOptionWidget(option))
			}
		});
		break;
	case "number":
		this.selector = new OO.ui.NumberInputWidget(); break;
	default:
		throw new Error("PrefsItemWidget: unrecognised type: "+model.type);
	}
	this.fieldLayout = new OO.ui.FieldLayout(this.selector, {
		help: model.help,
		helpInline: model.helpInline,
		$element: this.$element
	});

	this.controller = new PrefsItemController(this.model, this);
	this.controller.updateFromModel();
}
OO.inheritClass( PrefsItemWidget, OO.ui.Widget );

export default PrefsItemWidget;
// </nowiki>
