// <nowiki>

/**
 * 
 * @param {Object} config
 * @param {Boolean} config.multimode
 * @param {Boolean} config.relisting
 */
function RationaleWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	RationaleWidget.super.call( this, config );
	this.isMultimode = false;

	this.copyButton = new OO.ui.ButtonWidget( {
		label: "Copy from above",
		framed: false
	} );
	this.copyButton.toggle(this.isMultimode);
	this.copyButton.$element.css({"float":"right"});
	this.$element.append(this.copyButton.$element);

	
	this.textbox = new OO.ui.MultilineTextInputWidget( {
		rows: config.relisting ? 2 : 4
	} );
	this.$element.append(this.textbox.$element);

	if (!config.relisting) {
		this.newSentenceOption = new OO.ui.CheckboxMultioptionWidget( {
			label: "Result is a new sentence",
			selected: true
		} );
		this.$element.append(this.newSentenceOption.$element);
	}

	this.copyButton.connect(this, {"click": "onCopyClick"});
}
OO.inheritClass( RationaleWidget, OO.ui.Widget );

/**
 * @param {Boolean} isMultimode `true` to set multimode, `false` to set single-mode
 */
RationaleWidget.prototype.setMultimode = function(isMultimode) {
	this.copyButton.toggle(!!isMultimode);
};

RationaleWidget.prototype.onCopyClick = function() {
	this.emit("copyResultsClick");
};

RationaleWidget.prototype.prependRationale = function(text) {
	this.textbox.setValue(text + this.textbox.getValue());
};

export default RationaleWidget;
// </nowiki>