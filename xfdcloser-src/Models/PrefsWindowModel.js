import { OO } from "../../globals";
import PrefsGroup from "./PrefsGroup";
// <nowiki>

/**
 * Model for PrefsWindow
 */
class PrefsWindowModel {
	/**
	 * 
	 * @param {Object} config
	 *  @param {boolean} config.userIsSysop
	 */
	constructor(config) {
		// call mixin constructor
		OO.EventEmitter.call(this);

		this.preferences = new PrefsGroup({
			userIsSysop: config.userIsSysop
		});
		this.preferences.connect(this, {
			"update": ["emit", "update"],
			"itemUpdate": ["emit", "update"],
			"resize": ["emit", "update"]
		});
	}

	get actionAbilities() {
		return {
			savePrefs: this.preferences.changed,
			defaultPrefs: !this.preferences.allHaveDefaultValues()
		};
	}
}

OO.initClass( PrefsWindowModel );
OO.mixinClass( PrefsWindowModel, OO.EventEmitter );

export default PrefsWindowModel;
// </nowiki>
