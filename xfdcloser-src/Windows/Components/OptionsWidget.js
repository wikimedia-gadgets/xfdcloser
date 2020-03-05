// <nowiki>
import {actions, options} from "../../data";

/**
 * 
 * @param {Object} config
 * @param {String} config.label Label heading, defaults to "Options"
 * @param {Object} config.resultData data object for result
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {Boolean} config.isSysop
 * @param {jQuery} config.$overlay element for overlays
 */
function OptionsWidget(config) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	OptionsWidget.super.call( this, config );
	this.data = {
		"resultData": config.resultData
	};
	this.venue = config.venue;
	this.isSysop = config.isSysop;

	this.fieldset = new OO.ui.FieldsetLayout( {
		label: config.label || "Options"
	} );

	this.actions = new OO.ui.DropdownWidget( {
		$overlay: config.$overlay,
		menu: {
			items: actions
				.filter(action => config.resultData.actions.includes(action.data))
				.map(action => new OO.ui.MenuOptionWidget(action))
		}
	} );

	this.options = options
		.filter(option => {
			if (option.sysopOnly && !config.isSysop) {
				return false;
			}
			if (option.nonSysopOnly && config.isSysop) {
				return false;
			}
			return option.for.includes(config.resultData.result) && option.venue.includes(config.venue);
		})
		.map(option => {
			let widget;
			switch(option.type) {
			case "toggleSwitch":
				widget = new OO.ui.ToggleSwitchWidget();
				break;
			case "dropdown":
				widget = new OO.ui.DropdownWidget({
					$overlay: config.$overlay,
					menu: {
						items: option.items.map(item =>  new OO.ui.MenuOptionWidget(item))
					}
				});
				break;
			case "rcatMulitSelect":
				//widget = new rcatMulitSelect();
				widget = new OO.ui.DropdownInputWidget({});//TODO: Replace with rcat multiselect
				break;
			default:
				throw new Error("Unrecognised option type: " + option.type);
			}
			return {
				label: option.label,
				widget: widget
			};
		});

	this.fieldset.addItems( [
		new OO.ui.FieldLayout( this.actions, {
			label: "Actions"
		} ),
		...this.options.map(option => new OO.ui.FieldLayout( option.widget, {
			label: option.label
		} ))
	] );

	this.$element.append(this.fieldset.$element);
}
OO.inheritClass( OptionsWidget, OO.ui.Widget );

export default OptionsWidget;
// </nowiki>