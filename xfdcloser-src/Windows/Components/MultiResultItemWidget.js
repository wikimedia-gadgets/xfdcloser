// <nowiki>

/**
 * @param {Object} config
 * @param {mw.Title} config.page mw.Title object for a nominated page
 * @param {Object[]} config.resultData data for results
 * @param {jQuery} config.$overlay element for overlays
 */
function MultiResultItemWidget(config) {
	// Call the parent constructor
	MultiResultItemWidget.super.call( this, config );

	this.resultDropdown = new OO.ui.DropdownWidget( {
		menu: {
			items: config.resultData.map(resultData => new OO.ui.MenuOptionWidget( {
				data: resultData,
				label: resultData.result.slice(0,1).toUpperCase() + resultData.result.slice(1),
				title: resultData.result === "custom" ? "Close with a custom result" : `Close as "${resultData.result}"`
			}))
		}
	});
	this.resultField = new OO.ui.FieldLayout( this.resultDropdown, {
		label: config.page.getPrefixedText()
	} );

	this.targetTitle = new OO.ui.TextInputWidget( {
		validate: function(val) {
			return mw.Title.newFromText(val) !== null;
		}
	} );
	this.targetField = new OO.ui.FieldLayout( this.targetTitle, {
		label: "to:",
		align: "right"
	} );
	this.targetField.toggle(false);
	this.targetField.$element.css({margin: "6px 0 12px 0"});

	this.customResult = new OO.ui.TextInputWidget( {
		validate: "non-empty"
	} );
	this.customField = new OO.ui.FieldLayout( this.customResult, {
		label: "Result:",
		align: "right"
	} );
	this.customField.toggle(false);
	this.customField.$element.css({margin: "6px 0"});

	this.fieldset = new OO.ui.FieldsetLayout( {
		items: [
			this.resultField,
			this.targetField,
			this.customField
		]
	});

	this.$element.css({"margin-bottom":"6px"}).append(this.fieldset.$element);

	this.resultDropdown.getMenu().connect(this, {"choose": "onResultChoose"});
}
OO.inheritClass( MultiResultItemWidget, OO.ui.Widget );

MultiResultItemWidget.prototype.onResultChoose = function(result) {
	const data = result.getData();
	this.targetField.toggle(!!data.requireTarget);
	this.customField.toggle(data.result === "custom");
	this.emit("change");
};

MultiResultItemWidget.prototype.getSelectedResultData = function() {
	const selectedResult = this.resultDropdown.getMenu().findSelectedItem();
	return selectedResult && selectedResult.getData();
};

export default MultiResultItemWidget;
// </nowiki>