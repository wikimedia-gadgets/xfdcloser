// <nowiki>
const resultsData = [
	{
		result: "keep",
		allowSpeedy: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["keepActions", "noActions"]
	},
	{
		result: "delete",
		allowSpeedy: true,
		allowSoft: true,
		sysopOnly: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd"],
		actions: ["deleteActions", "noActions"]
	},
	{
		result: "delete",
		allowSpeedy: true,
		allowSoft: true,
		venues: ["tfd"],
		actions: ["deleteActions", "holdingCellActions", "noActions"]
	},
	{
		result: "redirect",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		venues: ["afd", "cfd", "mfd", "tfd"],
		actions: ["redirectActions", "noActions"]
	},
	{
		result: "retarget",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		venues: ["rfd"],
		actions: ["redirectActions", "noActions"]
	},
	{
		result: "disambiguate",
		venues: ["rfd"],
		actions: ["keepActions", "noActions"]
	},
	{
		result: "merge",
		requireTarget: true,
		venues: ["afd", "cfd", "mfd"],
		actions: ["keepActions", "noActions"]
	},
	{
		result: "merge",
		requireTarget: true,
		venues: ["tfd"],
		actions: ["holdingCellActions", "noActions"]
	},
	{
		result: "no consensus",
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["keepActions", "noActions"]
	},
	{
		result: "custom",
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["noActions"]
	}
];

/**
 * 
 * @param {Object} config
 * @param {mw.Title[]} config.pages mw.Title objects for nominated pages
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {Boolean} config.isSysop 
 */
function ResultWidget(config) {
	// Call the parent constructor
	ResultWidget.super.call( this, config );

	this.resultButtonSelect = new OO.ui.ButtonSelectWidget( {
		items: resultsData
			.filter(resultData => resultData.venues.includes(config.venue))
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
	this.optionsMultiselect.$element.find("label").css({"display":"inline-block", "margin-left":"1em"});
	
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
}
OO.inheritClass( ResultWidget, OO.ui.Widget );

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
};


export default ResultWidget;
export {resultsData};

// </nowiki>