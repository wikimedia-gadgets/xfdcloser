import MultiResultItemWidget from "./MultiResultItemWidget";
import DelayedChangeMixin from "../Mixins/DelayedChangeWidget";
import {resultsData} from "../../data";
// <nowiki>

/**
 * 
 * @param {Object} config
 * @param {mw.Title[]} config.pages mw.Title objects for nominated pages
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {Boolean} config.isSysop 
 * @param {jQuery} config.$overlay element for overlays
 */
function MultiResultGroupWidget(config) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	MultiResultGroupWidget.super.call( this, config );
	this.$group = $("<div>");
	this.$element.append(this.$group);
	// Mixin constructors
	OO.ui.mixin.GroupElement.call( this, $.extend( {
		$group: this.$group
	}, config ) );
	DelayedChangeMixin.call( this, config );
	
	const relevantResultData = resultsData
		.filter(resultData => resultData.venues.includes(config.venue) &&
			(resultData.sysopOnly ? config.isSysop : true) &&
			(resultData.nonSysopOnly ? !config.isSysop : true)
		);

	this.addItems(
		config.pages.map(page => new MultiResultItemWidget({
			resultData: relevantResultData,
			page: page,
			$overlay: config.$overlay
		}))
	);

	this.resultSummary = new OO.ui.TextInputWidget({
		validate: "non-empty"
	});
	this.resultSummaryField = new OO.ui.FieldLayout( this.resultSummary, {
		label: $("<strong>").text("Result summary"),
	} );
	this.$element.append(this.resultSummaryField.$element);
	
	this.aggregate( {change: "resultChange"} );
	this.connect( this, {"resultChange": "onResultChange"} );
	this.resultSummary.connect( this, {"change": "emitDelayedChange"});
}
// Setup
OO.inheritClass( MultiResultGroupWidget, OO.ui.Widget );
OO.mixinClass( MultiResultGroupWidget, OO.ui.mixin.GroupElement );
OO.mixinClass( MultiResultGroupWidget, DelayedChangeMixin );

MultiResultGroupWidget.prototype.onResultChange = function() {
	const uniqueResultsData = extraJs.uniqueArray(this.items
		.map(item => item.getSelectedResultData())
		.filter(resultData => !!resultData)
		.map(resultData => JSON.stringify(resultData))
	)
		.map(resultDataString => JSON.parse(resultDataString));

	this.emit("resultSelect", uniqueResultsData);
	this.emitChange();
};

MultiResultGroupWidget.prototype.getResultsByPage = function() {
	return this.items.map(item => ({
		page: item.page,
		data: item.getSelectedResultData(),
		resultType: item.getSelectedResultData().result
	}) );
};

MultiResultGroupWidget.prototype.getResultText = function() {
	return this.resultSummary.getValue().trim();
};

/**
 * @returns {Promise} A promise that resolves if valid, rejects if not.
 */
MultiResultGroupWidget.prototype.getValidity = function() {
	return $.when.apply(null, [
		...this.items.map(item => item.getValidity()),
		this.resultSummary.getValidity()
	]);
};

export default MultiResultGroupWidget;
// </nowiki>