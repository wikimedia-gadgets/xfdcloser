import { OO } from "../../globals";
import OptionsItem from "./OptionsItem";
// <nowiki>

class Options {
	/**
	 * 
	 * @param {Object} config
	 *  @param {Result} config.result
	 *  @param {Venue} config.venue
	 *  @param {Boolean} config.userIsSysop
	 */
	constructor(config) {
		// call mixin constructors
		OO.EventEmitter.call(this);
		OO.EmitterList.call(this);

		this.result = config.result;
		this.venue = config.venue;
		this.userIsSysop = config.userIsSysop;

		this.result.connect(this, {"update": "onResultUpdate"});
	}

	get isValid() {
		return this.getItems().every(item => item.isValid);
	}

	/**
	 * 
	 * @param {String} result
	 * @returns {OptionsItem|OptionsItem[]} OptionsItem for all results, or a specific result, or null if not found
	 */
	getOptions(result) {
		return result
			? this.getItems().find(optionItem => optionItem.result === result)
			: this.getItems();
	}

	/**
	 * 
	 * @param {String} result
	 * @returns {Object<string,string|string[]|boolean>} Object of option values, keyed by option name; or null if not foun
	 */
	getOptionValues(result) {
		const resultOptions = this.getOptions(result);
		return resultOptions && resultOptions.values;
	}

	onResultUpdate() {
		const uniqueResults = this.result.uniqueSelectedResultsNames;
		// Keep a copy of the existing items
		const existingItems = this.getItems();
		if (
			existingItems.length === uniqueResults.length &&
			existingItems.every(item => uniqueResults.includes(item.result))
		) {
			// No need to update
			return false;
		}
		this.clearItems();
		// Add items for each result, re-using existing items if possible
		this.addItems(
			uniqueResults.map(result => {
				return existingItems.find(item => item.result === result) || new OptionsItem({
					result,
					venueType: this.venue.type,
					userIsSysop: this.userIsSysop
				});
			})
		);
		this.emit("update");
	}

	onItemUpdate() {
		this.emit("itemUpdate");
		// Hack to fix resizing bug when an action is selected:
		setTimeout(() => this.emit("itemUpdate"), 100);
	}
}
OO.initClass( Options );
OO.mixinClass( Options, OO.EventEmitter );
OO.mixinClass( Options, OO.EmitterList );

export default Options;
// </nowiki>
