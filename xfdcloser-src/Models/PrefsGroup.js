import { OO } from "../../globals";
import PrefsItem from "./PrefsItem";
import { getRelevantPrefs } from "../data";
import * as prefs from "../prefs";
// <nowiki>

class PrefsGroup {
	/**
	 * 
	 * @param {Object} config
	 *  @param {Boolean} config.userIsSysop
	 */
	constructor(config) {
		// call mixin constructors
		OO.EventEmitter.call(this);
		OO.EmitterList.call(this);

		this.userIsSysop = config.userIsSysop;
		this.addItems(
			getRelevantPrefs(config.userIsSysop).map(prefConfig => new PrefsItem(prefConfig, prefs.get(prefConfig.name)))
		);
	}

	get isValid() {
		return this.getItems().every(item => item.isValid);
	}

	get changed() {
		return this.getItems().some(item => item.changed);
	}

	/**
	 * @param {Object} options
	 *  @param {boolean} options.changedOnly
	 * @returns {Object<string,string|number|boolean>} Object of preference values, keyed by preference name
	 */
	getValues(options) {
		const prefs = {};
		const items = options && options.changedOnly
			? this.getItems().filter(item => item.changed)
			: this.getItems();
		items.forEach(item => {
			prefs[item.name] = item.value;
		});
		return prefs;
	}

	/**
	 * Reset the current and initial values
	 * @param {Object<string,string|number|boolean>} values Object of preference values, keyed by preference name
	 */
	resetValues(values) {
		this.items.forEach(item => {
			if ( values[item.name] !== undefined ) {
				item.reset(values[item.name]);
			}
		});
		this.emit("update");
	}

	restoreDefaults() {
		this.items.forEach(item => item.restoreDefault());
	}

	allHaveDefaultValues() {
		return this.getItems().every(item => item.hasDefaultValue());
	}

	onItemUpdate() {
		this.emit("itemUpdate");
	}
}
OO.initClass( PrefsGroup );
OO.mixinClass( PrefsGroup, OO.EventEmitter );
OO.mixinClass( PrefsGroup, OO.EmitterList );

export default PrefsGroup;
// </nowiki>
