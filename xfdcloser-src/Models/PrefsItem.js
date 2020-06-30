import { OO } from "../../globals";
import { defaultPrefValues } from "../data";
// <nowiki>

class PrefsItem {
	/**
	 * 
	 * @param {Object} config  Configuration data from the prefs constant in data.js
	 * @param {number|string|boolean} value  Current (or default) pref value
	 */
	constructor(config, value) {
		// call mixin constructor
		OO.EventEmitter.call(this);
		this.name = config.name;
		this.label = config.label,
		this.type = config.type,
		this.help = config.help,
		this.helpInline = config.helpInline,
		this.value = value;
		this.initialValue = value;
		this.options = config.options;
		this.min = config.min;
		this.max = config.max;
	}

	get isValid() {
		switch(this.type) {
		case "number":
			return typeof(this.value) === "number" &&
				!isNaN(this.value) &&
				( this.min !== undefined ? this.min <= this.value : true ) &&
				( this.max !== undefined ? this.max >= this.value : true );
		case "toggle":
			return typeof(this.value) === "boolean";
		case "dropdown":
			return this.options.find(option => option.data === this.value);
		}
		return this.getItems().every(item => item.isValid);
	}

	get changed() {
		return this.value !== this.initialValue;
	}

	get errors() {
		return this.isValid ? [] : ["Invalid value"];
	}

	/**
	 * @param {Object} options
	 *  @param {boolean} options.changedOnly
	 * @returns {Object<string,string|number|boolean>} Object of preference values, keyed by preference name
	 */
	setValue(value) {
		if ( this.value === value ) return false;
		this.value = this.type === "number" ? Number(value) : value;
		this.emit("update");
	}

	/**
	 * Reset both the value and the initial value
	 * @param {string|number|boolean} value 
	 */
	reset(value) {
		this.value = value;
		this.initialValue = value;
		this.emit("update");
	}

	restoreDefault() {
		this.setValue(defaultPrefValues[this.name]);
	}

	hasDefaultValue() {
		return this.value === defaultPrefValues[this.name];
	}
}
OO.initClass( PrefsItem );
OO.mixinClass( PrefsItem, OO.EventEmitter );
OO.mixinClass( PrefsItem, OO.EmitterList );

export default PrefsItem;
// </nowiki>