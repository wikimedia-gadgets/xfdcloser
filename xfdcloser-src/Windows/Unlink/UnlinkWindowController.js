// <nowiki>
/**
 * Controller linking window actions and views stackLayout with the model
 *
 * @param {UnlinkWindowModel} model
 * @param {Object} widgets
 * @param {OO.ui.StackLayout} widgets.views
 * @param {*} methods
 */
class UnlinkWindowController {
	constructor(model, widgets) {
		// Model
		this.model = model;
		// Widgets
		this.views = widgets.views;
		this.actions = widgets.actions;
		this.window = widgets.window;
		// Connect widgets and model
		this.model.connect(this, {
			update: "updateFromModel",
			resize: "onResize"
		});
		this.actions.connect(this, { click: "onActionClick" });
		// Ensure widgets reflect initial state of model
		this.updateFromModel();
	}
	// Update view (widgets) from model changes
	updateFromModel() {
		this.actions.setMode(this.model.mode);
		this.actions.setAbilities(this.model.actionAbilities);
		this.views.setItem( this.views.findItemFromData({ name: this.model.viewName }) );
		this.window.updateSize();
	}
	onResize() {
		this.window.updateSize();
	}
	// Update model from view (widgets) changes
	onActionClick(actionWidget) {
		const action = actionWidget.getAction();
		if (action === "start") {
			this.model.startTask();
		}
		else if (action === "abort") {
			this.model.abortTask();
		}
		else {
			this.window.close();
		}
	}
}

export default UnlinkWindowController;
// </nowiki>


