// <nowiki>
import {actions} from "../../data";

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

	const availableActions = actions.filter(
		action => config.resultData.actions.includes(action.data.name)
	);

	this.actionsDropdown = new OO.ui.DropdownWidget( {
		$overlay: config.$overlay,
		menu: {
			items: availableActions.map(action => new OO.ui.MenuOptionWidget(action))
		}
	} );

	this.fieldset.addItems( [
		new OO.ui.FieldLayout( this.actionsDropdown, {
			label: "Actions"
		} ),
	] );

	this.optionLayouts = availableActions.flatMap(action => {
		if (!Array.isArray(action.data.options)) {
			return [];
		}
		return action.data.options
			.filter(option => (
				option.venue.includes(config.venue) &&
				(option.sysopOnly ? config.isSysop : true) &&
				(option.nonSysopOnly ? !config.isSysop : true)
			))
			.map(option => {
				let widget;
				switch(option.type) {
				case "toggleSwitch":
					widget = new OO.ui.ToggleSwitchWidget({
						data: {name: option.name}
					});
					break;
				case "dropdown":
					widget = new OO.ui.DropdownWidget({
						data: {name: option.name},
						$overlay: config.$overlay,
						menu: {
							items: option.items.map(item =>  new OO.ui.MenuOptionWidget(item))
						}
					});
					widget.getValue = () => widget.getMenu().findSelectedItem().getData();
					break;
				case "rcatMulitSelect":
				//widget = new rcatMulitSelect();
					widget = new OO.ui.DropdownInputWidget({//TODO: Replace with rcat multiselect
						data: {name: option.name}
					});					
					widget.getValue = () => widget.getMenu().findSelectedItem().getData();
					break;
				default:
					throw new Error("Unrecognised option type: " + option.type);
				}
				const layout = new OO.ui.FieldLayout(widget, {
					label: option.label,
					data: {for: action.data.name}
				});
				layout.toggle(false);
				return layout;
			});
	});

	this.fieldset.addItems(this.optionLayouts);

	this.$element.append(this.fieldset.$element);

	this.actionsDropdown.getMenu().connect(this, {
		"choose": "onActionChoose",
		"select": "onActionChoose"
	});
	this.actionsDropdown.getMenu().selectItem( this.actionsDropdown.getMenu().findFirstSelectableItem() );
}
OO.inheritClass( OptionsWidget, OO.ui.Widget );

OptionsWidget.prototype.onActionChoose = function(actionItem) {
	this.optionLayouts.forEach(optionLayout => optionLayout.toggle(
		optionLayout.getData().for === actionItem.getData().name
	)
	);
};

OptionsWidget.prototype.getValues = function() {
	let values = {
		action: this.actionsDropdown.getMenu().findSelectedItem().getData().name
	};
	this.optionLayouts.forEach(optionLayout => {
		if (optionLayout.isVisible()) {
			const widget = optionLayout.getField();
			values[widget.getData().name] = widget.getValue();
		}
	});
	return values;
};

export default OptionsWidget;
// </nowiki>