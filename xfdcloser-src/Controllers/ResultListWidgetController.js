import GroupedItemController from "./GroupItemController";
import ResultItemWidget from "../Views/ResultItemWidget";
// <nowiki>

export default class ResultListWidgetController extends GroupedItemController {
	constructor(model, widget) {
		super(model, widget);
		this.$overlay = widget.$overlay;
		this.updateGroupFromModel();
	}

	/**
	 * Create a new widget from an item in the model's #items property
	 * @param {*} modelItem 
	 * @returns {OO.ui.Widget}
	 */
	newItemWidget(modelItem) {
		return new ResultItemWidget(modelItem, {$overlay: this.$overlay});
	}

	onItemUpdate() {
		this.model.onItemUpdate();
	}
}
// </nowiki>