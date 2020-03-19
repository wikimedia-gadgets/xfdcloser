// <nowiki>
import {resultsData} from "../../data";
import DelayedChangeMixin from "../Mixins/DelayedChangeWidget";

/**
 * 
 * @param {Object} config
 * @param {mw.Title[]} config.pages mw.Title objects for nominated pages
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {Boolean} config.isSysop 
 */
function ResultWidget(config) {
	// Configuration initialization
	config = config || {};
	// Call the parent and mixin constructors
	ResultWidget.super.call( this, config );
	DelayedChangeMixin.call( this, config );

	this.resultButtonSelect = new OO.ui.ButtonSelectWidget( {
		items: resultsData
			.filter(resultData => resultData.venues.includes(config.venue) &&
				(resultData.sysopOnly ? config.isSysop : true) &&
				(resultData.nonSysopOnly ? !config.isSysop : true)
			)
			.map(resultData => new OO.ui.ButtonOptionWidget({
				data: resultData,
				label: resultData.result.slice(0,1).toUpperCase() + resultData.result.slice(1),
				title: resultData.result === "custom" ? "Close with a custom result" : `Close as "${resultData.result}"` 
			}))
	} );

	this.speedyOption = new OO.ui.CheckboxMultioptionWidget( {
		data: {prefix: "speedy "},
		label: "Speedy"
	} );
	this.softOption = new OO.ui.CheckboxMultioptionWidget( {
		data: {prefix: "soft "},
		label: "Soft"
	} );
	this.deleteFirstOption = new OO.ui.CheckboxMultioptionWidget( {
		data: {prefix: "delete and "},
		label: "Delete first"
	} );
	this.redirectAfterOption = new OO.ui.CheckboxMultioptionWidget( {
		data: {suffix: " and redirect"},
		label: "then redirect"
	} );

	this.optionsMultiselect = new OO.ui.CheckboxMultiselectWidget( {
		items: [
			this.speedyOption,
			this.softOption,
			this.deleteFirstOption,
			this.redirectAfterOption
		]
	} );
	this.optionsMultiselect.toggle(false);
	this.optionsMultiselect.$element.find("label").css({
		"display":"inline-block",
		"margin-left":"1em",
		"padding":"4px 0"
	});
	
	this.targetTitle = new OO.ui.TextInputWidget( {
		label: "to:",
		labelPosition: "before",
		validate: function(val) {
			return mw.Title.newFromText(val) !== null;
		}
	} );
	this.targetTitle.toggle(false);

	this.customResult = new OO.ui.TextInputWidget( {
		label: "Result:",
		labelPosition: "before",
		validate: "non-empty"
	} );
	this.customResult.toggle(false);

	this.$element.append(
		this.resultButtonSelect.$element,
		this.optionsMultiselect.$element,
		this.targetTitle.$element,
		this.customResult.$element
	);

	this.resultButtonSelect.connect(this, {"select": "onResultSelect"});
	this.optionsMultiselect.items.forEach(
		option => option.connect(this, {"change": ["onOptionsChange", option]})
	);
	this.targetTitle.connect(this, {"change": "emitDelayedChange"});
	this.customResult.connect(this, {"change": "emitDelayedChange"});
}
// Setup
OO.inheritClass( ResultWidget, OO.ui.Widget );
OO.mixinClass( ResultWidget, DelayedChangeMixin );

ResultWidget.prototype.onResultSelect = function(result) {
	const data = result.data;
	this.speedyOption.toggle(!!data.allowSpeedy);
	this.softOption.toggle(!!data.allowSoft);
	this.deleteFirstOption.toggle(!!data.allowDeleteFirst);
	this.redirectAfterOption.toggle(data.result === "delete");
	this.optionsMultiselect.toggle(
		!!data.allowSpeedy || !!data.allowSoft || !!data.allowDeleteFirst || data.result === "delete"
	);
	this.targetTitle.toggle(!!data.requireTarget);
	this.customResult.toggle(data.result === "custom");
	
	this.emit("resultSelect", result.data);
	this.emitChange();
};

ResultWidget.prototype.onOptionsChange = function(option) {
	if (option.isSelected()) {
		this.optionsMultiselect.items
			.filter(o => o !== option)
			.forEach(o => o.setSelected(false));
	}
	this.emitChange();
};

ResultWidget.prototype.getResultText = function() {
	const data = this.getSelectedResultData();
	if (!data) return null;
	if (data.result === "custom") {
		return this.customResult.getValue().trim();
	}
	const selectedOption = this.optionsMultiselect.isVisible() &&
		this.optionsMultiselect.findSelectedItems().filter(item => item.isVisible())[0];
	if (selectedOption) {
		const optionData = selectedOption.getData();
		return (optionData.prefix || "") + data.result + (optionData.suffix || "");
	}
	return data.result;
};

/**
 * @param {Object} mode
 * @param {Boolean} mode.raw Omit wikilink brackets
 */
ResultWidget.prototype.getTargetWikitext = function(mode) {
	const data  = this.getSelectedResultData();
	if (!data || !data.requireTarget) {
		return null;
	}
	const title = mw.Title.newFromText(this.targetTitle.getValue());
	if (!title) {
		return null;
	}
	var targetFrag = ( title.getFragment() ) ? "#" + title.getFragment() : "";
	var targetNS = title.getNamespaceId();
	if ( mode && mode.raw ) {
		return title.getPrefixedText() + targetFrag;
	} else if ( targetNS === 6 /* File */ || targetNS === 14 /* Category */  ) {
		return "[[:" + title.getPrefixedText() + targetFrag + "]]";
	} else {
		return "[[" + title.getPrefixedText() + targetFrag + "]]";
	}
};

ResultWidget.prototype.getSelectedResultData = function() {
	const selectedResult = this.resultButtonSelect.findSelectedItem();
	return  selectedResult && selectedResult.getData();
};

/**
 * @returns {Promise} A promise that resolves if valid, rejects if not.
 */
ResultWidget.prototype.getValidity = function() {
	const selectedResult = this.resultButtonSelect.findSelectedItem();
	if (!selectedResult) {
		return $.Deferred().reject();
	}
	if (this.targetTitle.isVisible()) {
		return this.targetTitle.getValidity();
	}
	if (this.customResult.isVisible()) {
		return this.customResult.getValidity();
	}
	return $.Deferred().resolve();
};

export default ResultWidget;
export {resultsData};

// </nowiki>