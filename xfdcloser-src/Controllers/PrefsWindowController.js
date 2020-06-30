import { $, OO } from "../../globals";
import * as prefs from "../prefs";
// <nowiki>

/**
 * Controller linking window actions and views stackLayout with the model
 *
 * @param {PrefsWindowModel} model
 * @param {OO.ui.ProcessDialog} window
 */
export default class PrefsWindowController {
	constructor(model, window) {
		this.model = model;
		this.window = window;
		// Connect widgets and model
		this.model.connect(this, {
			update: "updateFromModel",
			resize: this.window.updateSize
		});
		this.updateFromModel();
	}

	// 
	/**
	 * Update view from model changes
	 */
	updateFromModel() {
		this.window.actions.setAbilities(this.model.actionAbilities);
		this.window.updateSize();
	}

	/**
	 * Handle action events
	 * 
	 * @param {String} action selected action
	 * @returns {OO.ui.Process} Empty OO.ui.Process
	 */
	getActionProcess(action) {
		if ( action === "savePrefs" ) {
			this.window.pushPending();
			const changedPrefValues = this.model.preferences.getValues({changedOnly: true});
			return new OO.ui.Process()
				.next(() => prefs.set(changedPrefValues))
				.next(() => {
					this.model.preferences.resetValues(changedPrefValues);
					this.window.popPending();
				});
		} else if ( action === "defaultPrefs" ) {
			this.model.preferences.restoreDefaults();
		} else {
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
		const panelHeight = this.window.prefsPanel.$element.get(0).scrollHeight || 0;
		const errorsHeight = $(".oo-ui-processDialog-errors").get(0).scrollHeight || 0;
		// Must be at least the default height, or the current panel height, or the height needed for any errors
		return Math.max(
			DEFAULT_HEIGHT,
			panelHeight + SAFETY_MARGIN,
			errorsHeight + SAFETY_MARGIN
		);
	}
}
// </nowiki>


