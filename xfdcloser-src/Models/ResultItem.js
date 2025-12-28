import { mw, OO } from "../../globals";
// <nowiki>

function pageLinkNeedsColon(pageName) {
	const title = mw.Title.newFromText(pageName);
	return title && /^(File|Image|Category):.+/.test(title.getPrefixedText());
}

class ResultItem {
	/**
	 * 
	 * @param {Object} config
	 *  @param {Object[]} config.availableResults relevant result objects from data.js
	 *  @param {String} [config.pageName] 
	 *  @param {String} [config.selectedResultName] 
	 *  @param {Boolean} [config.softResult] 
	 *  @param {Boolean} [config.speedyResult] 
	 *  @param {Boolean} [config.deleteFirstResult] 
	 *  @param {String} [config.targetPageName] 
	 *  @param {String} [config.customResultText] 
	 * 
	 */
	constructor(config) {
		// call mixin constructor
		OO.EventEmitter.call(this);

		this.pageName = config.pageName;
		this.availableResults = config.availableResults,
		this.selectedResultName = config.selectedResultName || "";
		this.softResult = config.softResult || false;
		this.speedyResult = config.speedyResult || false;
		this.deleteFirstResult = config.deleteFirstResult || false;
		this.targetPageName = config.targetPageName || "";
		this.customResultText = config.customResultText || "";
	}
	
	// Aliases
	get name() {
		return this.pageName;
	}
	get resultName() {
		return this.selectedResultName;
	}

	/**
	 * @param {Object|null} selectedResult data object for selected result, or null if none selected
	 */
	get selectedResult() {
		return this.availableResults.find(result => result.name === this.selectedResultName);
	}

	/**
	 * @param {Boolean} showSpeedyResult
	 */
	get showSpeedyResult() {
		return !!this.selectedResult && !!this.selectedResult.allowSpeedy;
	}

	/**
	 * @param {Boolean} showSoftResult
	 */
	get showSoftResult() {
		return !!this.selectedResult && !!this.selectedResult.allowSoft;
	}

	/**
	 * @param {Boolean} showDeleteFirstResult
	 */
	get showDeleteFirstResult() {
		return !!this.selectedResult && !!this.selectedResult.allowDeleteFirst;
	}

	/**
	 * @param {Boolean} showResultOptions
	 */
	get showResultOptions() {
		return this.showSpeedyResult || this.showSoftResult || this.showDeleteFirstResult;
	}

	/**
	 * @param {Boolean} showTarget
	 */
	get showTarget() {
		return !!this.selectedResult && !!this.selectedResult.requireTarget;
	}

	/**
	 * @param {Boolean} targetIsValid
	 */
	get targetIsValid() {
		return ResultItem.validatePageName(this.targetPageName);
	}

	/**
	 * @param {Boolean} showCustomResult
	 */
	get showCustomResult() {
		return !!this.selectedResult && this.selectedResult.name === "custom";
	}

	/**
	 * @param {Boolean} customResultIsValid
	 */
	get customResultIsValid() {
		return ResultItem.validateNonEmpty(this.customResultText);
	}

	/**
	 * @returns {String}
	 */
	getResultText() {
		if ( !this.selectedResult ) {
			return "";
		} else if ( this.selectedResult.name === "custom") {
			return this.customResultText.trim();
		}
		const prefix = (
			( this.isSpeedy() && "speedy " ) ||
			( this.isSoft() && "soft " ) ||
			( this.isDeleteFirst() && "delete and ")
		);
		return ( prefix || "" ) + this.selectedResultName;
	}

	/**
	 * Target page formatted as a wikilink (default), or for "raw" format just
	 * the page name and fragment (transformed by mw.Title's text function).
	 * Text can be prepended, e.g. "to ". In all cases, returns an empty string
	 * if the target is invalid or not shown for the selected result.
	 * 
	 * @param {String} [format] "raw" or omitted
	 *  @param {Boolean} [format.raw] use "raw" format
	 *  @param {String} [format.prepend] text to prepend if target is valid/shown
	 * @returns {String} formatted target page
	 */
	getFormattedTarget(format) {
		if ( !this.targetIsValid || !this.showTarget ) return "";
		const prepend = format && format.prepend || "";
		const title = mw.Title.newFromText(this.targetPageName);
		const text = title.getPrefixedText();
		const fragment = title.getFragment();
		const raw = `${text}${fragment ? "#" + fragment : ""}`;
		if ( format && format.raw ) {
			return prepend + raw;
		} else {
			return `${prepend}[[${pageLinkNeedsColon(text) ? ":" : ""}${raw}]]`;
		}
	}

	/**
	 * @returns {Boolean}
	 */
	isValid() {
		return (
			!!this.selectedResult &&
			( !this.showTarget || this.targetIsValid ) &&
			( !this.showCustomResult || this.customResultIsValid )
		);
	}

	/**
	 * @returns {Boolean}
	 */
	isSpeedy() {
		return this.showSpeedyResult && this.speedyResult;
	}
	
	/**
	 * @returns {Boolean}
	 */
	isSoft() {
		return this.showSoftResult && this.softResult;
	}

	/**
	 * @returns {boolean}
	 */
	isSoftDelete() {
		return this.isSoft() && this.selectedResultName === "delete";
	}
	
	/**
	 * @returns {Boolean}
	 */
	isDeleteFirst() {
		return this.showDeleteFirstResult && this.deleteFirstResult;
	}

	setPageName(pageName) {
		this.pageName = pageName;
		this.emit("update");
	}

	setSelectedResultName(name) {
		this.selectedResultName = name;
		this.emit("update");
	}

	setSoftResult(isSoft) {
		this.softResult = !!isSoft;
		if ( this.softResult ) {
			this.speedyResult = false;
			this.deleteFirstResult = false;
		}
		this.emit("update");
		if (this.isSoftDelete()) {
			this.emit("softDeleteSelect");
		}
	}

	setSpeedyResult(isSpeedy) {
		this.speedyResult = !!isSpeedy;
		if ( this.speedyResult ) {
			this.softResult = false;
			this.deleteFirstResult = false;
		}
		this.emit("update");
	}

	setDeleteFirstResult(isDeleteFirst) {
		this.deleteFirstResult = !!isDeleteFirst;
		if ( this.deleteFirstResult ) {
			this.softResult = false;
			this.speedyResult = false;
		}
		this.emit("update");
	}

	setTargetPageName(target) {
		if ( this.targetPageName === target ) { return false; }
		this.targetPageName = target;
		this.emit("update");
	}

	setCustomResultText(text) {
		if ( this.customResultText === text ) { return false; }
		this.customResultText = text;
		this.emit("update");
	}

	static validatePageName(pageName) {
		return !!mw.Title.newFromText(pageName);
	}

	static validateNonEmpty(value) {
		return !!value.trim();
	}

	static newWithPageName(resultItem, pageName) {
		const newResultItem = new ResultItem(resultItem);
		newResultItem.setPageName(pageName);
		return newResultItem;
	}
}
OO.initClass( ResultItem );
OO.mixinClass( ResultItem, OO.EventEmitter );

export default ResultItem;
// </nowiki>
