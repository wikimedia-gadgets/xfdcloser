import { $, OO } from "../../globals";
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
	constructor(model, window) {
		this.model = model;
		this.window = window;
		this.stackLayout = window.stackLayout;
		this.actions = window.actions;
		// Connect widgets and model
		this.model.connect(this, {
			update: "updateFromModel",
			resize: this.window.updateSize
		});
		this.updateFromModel();
	}

	/**
	 * @prop {OO.ui.PanelLayout} currentPanel
	 */
	get currentPanel() {
		const panel = this.stackLayout.findItemFromData({ name: this.model.currentPanel });
		if ( !panel ) {
			throw new Error("Could not find panel with name: " + this.model.currentPanel);
		}
		return panel;
	}

	// 
	/**
	 * Update view from model changes
	 */
	updateFromModel() {	
		this.actions.setMode(this.model.mode);
		this.actions.setAbilities(this.model.actionAbilities);
		this.stackLayout.setItem( this.currentPanel );
		this.window.updateSize();
	}

	/**
	 * Handle action events
	 * 
	 * @param {String} action selected action
	 * @returns {OO.ui.Process} Empty OO.ui.Process
	 */
	getActionProcess(action) {
		if ( action === "start" ) {
			this.model.startTask();
		} else if ( action === "abort" ) {
			this.model.abortTask();
		} else if ( !action && this.model.canClose ) {
			this.window.close();
		}
		return new OO.ui.Process();
	}

	/**
	 * Get the body height for the window.
	 * 
	 * @returns {number} height in pixels
	 */
	getBodyHeight() {
		const DEFAULT_HEIGHT = 200; //px. Minimum height for window body at all times.
		const SAFETY_MARGIN = 1; //px. Additional height to make sure content fits in window without scrolling.
		const panelHeight = this.currentPanel.$element.get(0).scrollHeight || 0;
		const errorsHeight = $(".oo-ui-processDialog-errors").get(0).scrollHeight || 0;
		// Must be at least the default height, or the current panel height, or the height needed for any errors
		return Math.max(
			DEFAULT_HEIGHT,
			panelHeight + SAFETY_MARGIN,
			errorsHeight + SAFETY_MARGIN
		);
	}
}

export default UnlinkWindowController;
// </nowiki>


