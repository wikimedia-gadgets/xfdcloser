import { OO } from "../../globals";
import LookupMenuTagMultiselectWidget from "../Components/LookupMenuTagMultiselectWidget";
// <nowiki>

class OptionsItemController {
	constructor(model, widget) {
		this.model = model;
		this.model.connect(this, {update: "updateFromModel"});

		this.widget = widget;
		this.widget.fieldset.aggregate({widgetChange: "fieldWidgetChange"});
		this.widget.fieldset.connect(this, {fieldWidgetChange: "onFieldWidgetChange"});
		this.widget.actionsDropdown.getMenu().connect(this, {
			choose: "onActionChange",
			select: "onActionChange"
		});
	}

	updateFromModel() {
		// Update label
		this.widget.fieldset.setLabel(this.model.label);

		// Update actions dropdown
		const actionsDropdownMenu = this.widget.actionsDropdown.getMenu();
		if ( actionsDropdownMenu.items.length === 0 ) {
			actionsDropdownMenu.addItems(
				this.model.actions.map(action => new OO.ui.MenuOptionWidget({
					label: action.label,
					data: {name: action.name}
				}))
			);
		}
		actionsDropdownMenu.selectItemByData({name: this.model.selectedActionName});

		// Update fieldset fieldlayouts (except the one for actions).
		// Initially remove everything, than add back (new or updated) fields
		// which correspond to the current model state.
		const fieldLayouts = this.widget.fieldset.items.slice(1);
		this.widget.fieldset.removeItems(fieldLayouts);
		this.widget.fieldset.addItems(
			this.model.options.map(option => {
				const fieldLayout = fieldLayouts.find(
					field => field.getData().name === option.name
				);
				if ( fieldLayout ) {
					fieldLayout.getField().setValue(option.value);
					return fieldLayout;
				}
				return this.newFieldLayout(option);
			})
		);
		this.widget.emit("update");
	}

	onActionChange(option) {
		this.model.setSelectedActionName(option && option.getData().name);
	}

	onFieldWidgetChange(fieldLayout) {
		const optionName = fieldLayout.getData().name;
		const optionValue = fieldLayout.getField().getValue();
		this.model.setOptionValue(optionName, optionValue);
	}

	newFieldLayout(option) {
		let widget;
		switch(option.type) {
		case "toggleSwitch":
			widget = new OO.ui.ToggleSwitchWidget({value: option.value});
			break;
		case "dropdown":
			widget = new OO.ui.DropdownWidget({
				$overlay: this.widget.$overlay,
				menu: {
					items: option.items.map(item =>  new OO.ui.MenuOptionWidget(item))
				}
			});
			widget.getValue = () => {
				const selected = widget.getMenu().findSelectedItem();
				return selected && selected.getData();
			};
			widget.setValue = (value) => { widget.getMenu().selectItemByData(value); };
			widget.setValue(option.value);
			break;
		case "lookupMenuTagMultiselect":
			widget = new LookupMenuTagMultiselectWidget({
				data: {name: option.name},
				allowArbitrary: true,
				$overlay: this.widget.$overlay,
				popup: false,
				menu: {
					items: option.items.flatMap(itemgroup => [
						new OO.ui.MenuSectionOptionWidget({label: itemgroup.group}),
						...itemgroup.names.map(
							name => new OO.ui.MenuOptionWidget( {data: "{{"+name+"}}", label: "{{"+name+"}}"} )
						)
					])
				}
			});
			if (option.value) {
				widget.setValue(option.value);
			}
			break;
		default:
			throw new Error("Unrecognised option type: " + option.type);
		}

		const layout = new OO.ui.FieldLayout(widget, {
			label: option.label,
			data: { name: option.name }
		});

		switch(option.type) {
		case "lookupMenuTagMultiselect":
		case "toggleSwitch":
			widget.on("change", () => layout.emit("widgetChange"));
			break;
		case "dropdown":
			widget.getMenu().on("choose", () => layout.emit("widgetChange"));
			widget.getMenu().on("select", () => layout.emit("widgetChange"));
		}

		return layout;
	}
}

export default OptionsItemController;
// </nowiki>
