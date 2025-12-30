import GroupedItemController from "./GroupItemController";
import OptionsItemWidget from "../Views/OptionsItemWidget";
// <nowiki>

export default class OptionsPanelController extends GroupedItemController {
	constructor(model, widget) {
		super(model, widget);
		this.$overlay = widget.$overlay;
	}

	/**
	 * Create a new widget from an item in the model's #list property
	 * @param {*} modelItem 
	 * @returns {OO.ui.Widget}
	 */
	newItemWidget(modelItem) {
		return new OptionsItemWidget(modelItem, {$overlay: this.$overlay});
	}

	onItemUpdate() {
		this.model.onItemUpdate();
	}
}
// </nowiki>
