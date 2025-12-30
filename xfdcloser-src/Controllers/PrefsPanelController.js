import GroupedItemController from "./GroupItemController";
import PrefsItemWidget from "../Views/PrefsItemWidget";
// <nowiki>

export default class PrefsPanelController extends GroupedItemController {
	constructor(model, widget) {
		super(model, widget.fieldset);
		this.$overlay = widget.$overlay;
		this.updateGroupFromModel();
	}

	/**
	 * Create a new widget from an item in the model's #list property
	 * @param {*} modelItem 
	 * @returns {OO.ui.Widget}
	 */
	newItemWidget(modelItem) {
		return new PrefsItemWidget(modelItem, {$overlay: this.$overlay});
	}

	onItemUpdate() {
		this.model.onItemUpdate();
	}
}
// </nowiki>
