import DelayedChangeMixin from "../Mixins/DelayedChangeMixin";
// <nowiki>

/**
 * @param {Object} config
 * @param {mw.Title} config.page mw.Title object for a nominated page
 * @param {Object[]} config.resultData data for results
 * @param {jQuery} config.$overlay element for overlays
 */
function MultiResultItemWidget(config) {
	// Configuration initialization
	config = config || {};
	// Call the parent and mixin constructors
	MultiResultItemWidget.super.call( this, config );
	DelayedChangeMixin.call( this, config );

	this.page = config.page;

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
	this.targetTitle.connect(this, {"change": "emitDelayedChange"});
	this.customResult.connect(this, {"change": "emitDelayedChange"});
}
OO.inheritClass( MultiResultItemWidget, OO.ui.Widget );
OO.mixinClass( MultiResultItemWidget, DelayedChangeMixin );

MultiResultItemWidget.prototype.onResultChoose = function(result) {
	const data = result.getData();
	this.targetField.toggle(!!data.requireTarget);
	this.customField.toggle(data.result === "custom");
	this.emitChange();
};

MultiResultItemWidget.prototype.getSelectedResultData = function() {
	const selectedResult = this.resultDropdown.getMenu().findSelectedItem();
	const data = selectedResult && selectedResult.getData() && { ...selectedResult.getData() };
	if (data && data.requireTarget) {
		data.target = this.targetTitle.getValue().trim();
	}
	if (data && (data.result === "custom")) {
		data.customResult = this.customResult.getValue().trim();
	}
	return data;
};

/**
 * @returns {Promise} A promise that resolves if valid, rejects if not.
 */
MultiResultItemWidget.prototype.getValidity = function() {
	const selectedResult = this.resultDropdown.getMenu().findSelectedItem();
	if (!selectedResult) {
		return $.Deferred().reject();
	}
	if (this.targetField.isVisible()) {
		return this.targetTitle.getValidity();
	}
	if (this.customField.isVisible()) {
		return this.customResult.getValidity();
	}
	return $.Deferred().resolve();
};

export default MultiResultItemWidget;
// </nowiki>