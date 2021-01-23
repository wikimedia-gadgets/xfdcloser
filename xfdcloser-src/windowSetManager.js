import { $, OO } from "../globals";
import MainWindow from "./Views/MainWindow";
import UnlinkWindow from "./Views/UnlinkWindow";
import PrefsWindow from "./Views/PrefsWindow";

/**
 * @private
 */
class WindowManager extends OO.ui.WindowManager {
	constructor(config) {
		super(config);
	}
	/**
	 * Checks if this manager has a window that is open or opening
	 * @returns {boolean}
	 */
	hasOpenWindow() {
		const currentWindow = this.getCurrentWindow();
		if (currentWindow && (currentWindow.isOpened() || currentWindow.isOpening())) {
			// A dialog window is open or opening
			return true;
		}
		return false;
	}
}

class WindowSetManager {
	constructor() {
		/**
		 * @prop {OO.Factory}
		 */
		this.factory = (function() {
			const factory = new OO.Factory();
			// Register window constructors with the factory.
			factory.register(MainWindow);
			factory.register(UnlinkWindow);
			factory.register(PrefsWindow);
			return factory;
		})();
		/**
		 * @prop {WindowManager[]}
		 */
		this.windowManagers = [];
		
	}

	/**
	 * Gets the next idle window manager, or if there is none, instantiates
	 * and returns a new window manager
	 * @returns {WindowManager}
	 */
	nextManager() {
		let manager = this.windowManagers.find(windowManager => !windowManager.hasOpenWindow());
		if (!manager) {
			// No current managers are available, so create a new one
			manager = new WindowManager( {
				"factory": this.factory
			} );
			// Define method to check for open windows
			manager.hasOpenWindow = function() {
				const currentWindow = manager.getCurrentWindow();
				if (currentWindow && (currentWindow.isOpened() || currentWindow.isOpening())) {
					// Another dialog window is already open
					return true;
				}
				return false;
			};
			// Add it to the DOM
			$( document.body ).append( manager.$element );
			// Add it to the array of window managers
			this.windowManagers.push(manager);
		}
		return manager;
	}

	/**
	 * 
	 * @param {OO.ui.Window|string} win Window object or symbolic name of window to open
 	 * @param {Object} [data] Window opening data
	 * @return {OO.ui.WindowInstance} Window instance
	 */
	openWindow(win, data) {
		return this.nextManager().openWindow(win, data);
	}

	/**
	 * Checks if one or more windows within the set of managers are open or opening.
	 * @returns {boolean}
	 */
	hasOpenWindows() {
		return this.windowManagers.some(windowManager => windowManager.hasOpenWindow());
	}
}

const windowSetManager = new WindowSetManager();
export default windowSetManager;