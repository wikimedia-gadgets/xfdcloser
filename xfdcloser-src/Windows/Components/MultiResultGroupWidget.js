import MultiResultItemWidget from "./MultiResultItemWidget";
import {resultsData} from "./ResultWidget";
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
	// Mixin constructor
	OO.ui.mixin.GroupElement.call( this, $.extend( {
		$group: this.$group
	}, config ) );
	
	const relevantResultData = resultsData.filter(resultData => {
		if (resultData.sysopOnly && !config.isSysop) {
			return false;
		}
		return resultData.venues.includes(config.venue);
	});

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
	
	this.aggregate( {
		change: "resultChange"
	} );

	this.connect( this, {
		resultChange: "onResultChange"
	} );
}
OO.inheritClass( MultiResultGroupWidget, OO.ui.Widget );
OO.mixinClass( MultiResultGroupWidget, OO.ui.mixin.GroupElement );

MultiResultGroupWidget.prototype.onResultChange = function() {
	const uniqueResultsData = extraJs.uniqueArray(this.items
		.map(item => item.getSelectedResultData())
		.filter(resultData => !!resultData)
		.map(resultData => JSON.stringify(resultData))
	)
		.map(resultDataString => JSON.parse(resultDataString));

	this.emit("resultSelect", uniqueResultsData);
};

MultiResultGroupWidget.prototype.getResultsByPage = function() {
	return this.items.map(item => ({
		page: item.page,
		data: item.getSelectedResultData()
	}) );
};

export default MultiResultGroupWidget;
// </nowiki>