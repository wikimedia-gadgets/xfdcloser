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
		this.newSentenceOption.connect(this, {"change": "onNewSentenceOptionChange"});
		this.$element.append(this.newSentenceOption.$element);
	}

	this.copyButton.connect(this, {"click": "onCopyClick"});
	this.textbox.connect(this, {"change": "onTextChange"});
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

RationaleWidget.prototype.onTextChange = function() {
	// Delay before emitting a change event (i.e. waiting until user has finished typing)
	const delayMilliseconds = 800;

	// If there's a timeout from a previous change, clear it
	if (this.changeTimerID) {
		clearTimeout(this.changeTimerID);
	}

	// Set a new timeout for emitting a change event
	this.changeTimerID = setTimeout(
		() => this.emit("change"),
		delayMilliseconds
	);
};

RationaleWidget.prototype.onNewSentenceOptionChange = function() {
	// If there's a timeout from a previous change, clear it
	if (this.changeTimerID) {
		clearTimeout(this.changeTimerID);
	}
	// Emit a change event
	this.emit("change");
};

RationaleWidget.prototype.prependRationale = function(text) {
	this.textbox.setValue(text + this.textbox.getValue());
};

/**
 * @param {String} [format] Optional, either omit or set to "punctuated",
 * either an empty string will be returned if no rationale has been entered, or the trimmed rationale prepeneded with
 * either a space, or a period and a space, will be returned (based on if the new sentence option is selected)
 * @returns {String} Rationale - either an empty string if no rationale entered, or the trimmed rationale (format parameter ommited),
 * or (punctuated format) the trimmed rationale preprened with either a period and a space, or a space, based on the "Result is a new sentence" option
 */
RationaleWidget.prototype.getValue = function(format) {
	const text = this.textbox.getValue();
	if (!text.trim()) {
		return "";
	}
	if (format === "punctuated") {
		const isNewSentence = this.newSentenceOption && this.newSentenceOption.isSelected();
		return (isNewSentence ? ". " : " ") + text.trim();
	}
	return text.trim();
};

export default RationaleWidget;
// </nowiki>