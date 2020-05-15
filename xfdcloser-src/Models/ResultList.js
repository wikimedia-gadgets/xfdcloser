import { OO } from "../../globals";
import ResultItem from "./ResultItem";
// <nowiki>

class ResultList {
	/**
	 * 
	 * @param {Object} config
	 *  @param {Object[]} config.availableResults relevant result objects from data.js
	 *  @param {String[]} config.pageNames
	 */
	constructor(config) {
		// call mixin constructors
		OO.EventEmitter.call(this);
		OO.EmitterList.call(this);
		this.addItems(
			config.pageNames.map(pageName => new ResultItem({
				availableResults: config.availableResults,
				pageName: pageName
			}))
		);
	}

	onItemUpdate() {
		this.emit("update");
	}
}
OO.initClass( ResultList );
OO.mixinClass( ResultList, OO.EventEmitter );
OO.mixinClass( ResultList, OO.EmitterList );

export default ResultList;
// </nowiki>