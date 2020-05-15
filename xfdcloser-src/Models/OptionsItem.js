import { OO } from "../../globals";
import { getRelevantActions, getRelevantOptions } from "../data";
// <nowiki>

class OptionsItem {
	/**
	 * 
	 * @param {Object} config
	 *  @param {String} config.result
	 *  @param {String} config.venueType
	 *  @param {Boolean} config.userIsSysop
	 */
	constructor(config) {
		// call mixin constructor
		OO.EventEmitter.call(this);

		this.result = config.result;
		this.actions = getRelevantActions(config.venueType, config.userIsSysop, config.result);
		this._options = getRelevantOptions(config.venueType, config.userIsSysop, this.actions);
		this.selectedActionName = this.actions[0].name; // make first action the default selection
	}
	get name() {
		return this.result;
	}
	get label() {
		if ( this.result === "custom" ) {
			return "Custom result options";
		}
		return `"${this.result.slice(0,1).toUpperCase() + this.result.slice(1)}" result options`;
	}

	get selectedAction() {
		return this.actions.find(action => action.name === this.selectedActionName);
	}
	get options() {
		const selectedAction = this.selectedAction;
		if ( !selectedAction || !selectedAction.options || !selectedAction.options.length ) {
			return [];
		}
		return this._options.filter(option => selectedAction.options.includes(option.name));
	}
	
	get isValid() {
		return !!this.selectedAction && this.options.every(option => option.value !== null && option.value !== undefined);
	}

	/** 
	 * @returns {Object<string,string|string[]|Boolean>} Object of action and option values, keyed by name
	 */
	get values() {
		const values = {
			action: this.selectedAction && this.selectedAction.name
		};
		this.options.forEach(option => {
			values[option.name] = option.value;
		});
		return values;
	}

	setSelectedActionName(name) {
		if ( this.selectedActionName === name ) { return false; }
		this.selectedActionName = name || "";
		this.emit("update");
	}

	/**
	 * 
	 * @param {Boolean|String|String[]|null} value1 
	 * @param {Boolean|String|String[]|null} value2 
	 */
	static optionValuesEqual(value1, value2) {
		if ( typeof value1 !== typeof value2 ) {
			return false;
		}
		const [comparisonVal1, comparisonVal2] = [value1, value2].map(
			value => Array.isArray(value) ? value.join("|") : value
		);
		return comparisonVal1 === comparisonVal2;
	}

	/**
	 * 
	 * @param {String} optionName 
	 * @param {Boolean|String|String[]} optionValue 
	 */
	setOptionValue(optionName, optionValue) {
		const option = this._options.find(_option => _option.name === optionName );
		if ( !option ) {
			throw new Error("Could not find option with name: "+optionName);
		} else if ( OptionsItem.optionValuesEqual(option.value, optionValue) ) {
			return false;
		}
		option.value = optionValue;
		this.emit("update");
	}
}
OO.initClass( OptionsItem );
OO.mixinClass( OptionsItem, OO.EventEmitter );

export default OptionsItem;
// </nowiki>