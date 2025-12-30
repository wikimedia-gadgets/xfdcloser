import TaskItemWidget from "../Views/TaskItemWidget";
import GroupedItemController from "./GroupItemController";
// <nowiki>

export default class TaskListPanelController extends GroupedItemController {
	constructor(model, widget) {
		super(model, widget.fieldset);
		this._startedItems = false;
	}

	/**
	 * Create a new widget from an item in the model's #list property
	 * @param {TaskItem} modelItem 
	 * @returns {OO.ui.Widget}
	 */
	newItemWidget(modelItem) {
		return new TaskItemWidget(modelItem);
	}

	onItemUpdate(itemWidget) {
		this.model.onItemUpdate(itemWidget.model);
	}
	
	// Hack to force task items to start. For some reason TaskItemControllers
	// aren't responding to "update" events if the TaskList updates the items
	// directly.
	updateFromModel() {
		if ( this.model.started && !this._startedItems ) {
			this._startedItems = true;
			this.group.items.forEach(itemWidget => itemWidget.model.start());
		}
		//this.group.getItems().forEach(itemWidget => itemWidget.controller.updateFromModel());
	} 
}
// </nowiki>
