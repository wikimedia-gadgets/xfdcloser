import { OO } from "../../globals";
//import * as prefs from "../prefs";
// <nowiki>

/**
 * Model for PrefsWindow
 */
class PrefsWindowModel {
	/**
	 * 
	 * @param {Object} config
	 *  @param {Object<string,string|number|boolean>} config.prefs preference values keyed by pairs
	 */
	constructor(config) {
		// call mixin constructor
		OO.EventEmitter.call(this);

		this.prefs = config.prefs;
		this.changed = false;
	}

	get actionAbilities() {
		return {
			savePrefs: this.changed,
			defaultPrefs: true,
		};
	}

	setPref(name, val) {
		this.prefs[name] = val;
		this.emit("update");
	}

	onSave() {
		this.changed = false;
		this.emit("update");
	}
}

OO.initClass( PrefsWindowModel );
OO.mixinClass( PrefsWindowModel, OO.EventEmitter );

export default PrefsWindowModel;
// </nowiki>
