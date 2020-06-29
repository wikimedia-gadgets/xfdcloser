// <nowiki>

/**
 * Controller that updates a group widget from a model.
 * 
 * This is an abstract class that must be extended, with a method that
 * overrides #newItemWidget.
 * 
 * The #updateFromModel method may be overriden if the view has elements other
 * than the group that require updating.
 * 
 * The group widget's items are not updated directly, as it is expected that they each
 * have their own controller to do that for them.
 * 
 * The model must inherit from the OO.EmitterList, and each item added with
 * the #addItems method must have a `name` property with a unique string.
 * @abstract
 */
export default class GroupedItemController {
	/**
	 * 
	 * @param {OO.EventList} model 
	 * @param {OO.ui.GroupWidget} group 
	 */
	constructor(model, group) {
		if ( !model ) {
			throw new Error("GroupedItemController: model must be defined.");
		} else if ( !Array.isArray(model.items) ) {
			console.warn("GroupedItemController: model.items = ", model.items);
			throw new Error("GroupedItemController: Expected model.items to be an array");
		} else if ( !group ) {
			throw new Error("GroupedItemController: group must be defined.");
		} else if ( !Array.isArray(group.items) ) {
			console.warn("GroupedItemController: group.items = ", group.items);
			throw new Error("GroupedItemController: Expected group.items to be an array");
		}

		this.model = model;
		this.group = group;

		this.model.connect(this, {update: "updateGroupFromModel"});
		this.group.aggregate({"update": "itemUpdate"});
		this.group.connect(this, {"itemUpdate": "onItemUpdate"});
	}

	updateGroupFromModel() {
		const widgetItems = this.group.getItems();
		const widgetInputStates = {};
		widgetItems.forEach(widget => {
			if ( widget.getInputStates ) {
				widgetInputStates[widget.getData().name] = widget.getInputStates();
			}
		});
		// Update group widget: Initially remove everything, than add back
		// (new or existing) item widgets which correspond to the current
		// model state.
		this.group.clearItems();
		const newWidgetItems = this.model.getItems().map(modelItem => {
			let widget = widgetItems.find(widgetItem => widgetItem.getData().name === modelItem.name);
			if ( !widget ) {
				if ( !modelItem.name ) {
					throw new Error("Models for group item widgets must have names!");
				}
				widget = this.newItemWidget(modelItem);
				const data = widget.getData() || {};
				widget.setData({
					...data,
					name: modelItem.name
				});
			}
			return widget;
		});
		this.group.addItems( newWidgetItems );
		newWidgetItems.forEach(widget => {
			const state = widgetInputStates[widget.getData().name];
			if ( state && widget.setInputStates ) {
				widget.setInputStates(state);
			}
		});
		this.updateFromModel();
	}

	/**
	 * Create a new widget from an item in the model's #list property.
	 * @virtual
	 * @param {*} modelItem 
	 * @returns {OO.ui.Widget}
	 */
	newItemWidget() {}

	/**
	 * Update view (other than the group widget) from the model
	 * @virtual
	 */
	updateFromModel() {}
}
// </nowiki>