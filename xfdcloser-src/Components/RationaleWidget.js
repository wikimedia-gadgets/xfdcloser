import DelayedChangeMixin from "../Mixins/DelayedChangeMixin";
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
	// Call the parent and mixin constructors
	RationaleWidget.super.call( this, config );
	DelayedChangeMixin.call( this, config );

	this.isMultimode = false;

	this.copyButton = new OO.ui.ButtonWidget( {
		label: "Copy from above",
		framed: false
	} );
	this.copyButton.toggle(this.isMultimode);
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
		this.newSentenceOption.connect(this, {"change": "emitChange"});
		this.$element.append(this.newSentenceOption.$element);
	}

	this.copyButton.connect(this, {"click": "onCopyClick"});
	this.textbox.connect(this, {"change": "emitDelayedChange"});
}
// Setup
OO.inheritClass( RationaleWidget, OO.ui.Widget );
OO.mixinClass( RationaleWidget, DelayedChangeMixin );

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

/**
 * @param {String} [format] Optional, either omit or set to "punctuated" or "escaped"
 * @returns {String} Rationale, either an empty string if no rationale entered, or
 *  - format is `punctuated`: the rationale, trimmed, and prepeneded by  either a period and a space, or a space, based on the "Result is a new sentence" option
 *  - format is `escaped`: the rationale, trimmed, trimmed, with pipes not within templates or links escaped
 *  - format is omitted: the rationale, trimmed
 *  - In all cases, a linebreak is prepeneded if the rational starts with `*`, `:`, or `;`
 */
RationaleWidget.prototype.getValue = function(format) {
	const text = this.textbox.getValue().trim();
	if (!text) {
		return "";
	}

	const firstChar = text.slice(0,1);
	const needsLinebreak = firstChar === "*" || firstChar === ":" || firstChar === ";";

	if (format === "punctuated") {
		const isNewSentence = this.newSentenceOption && this.newSentenceOption.isSelected();
		return `${isNewSentence ? "." : ""}${needsLinebreak ? "\n" : " "}${text}`;
	}

	return (needsLinebreak ? "\n" : "") + (format === "escaped" ? text.replace(/(\|)(?!(?:[^[]*]|[^{]*}))/g, "&#124;") : text);
};

RationaleWidget.prototype.setSoftDelete = function(page, nomPageLink, isMulti) {
	if (this.textbox.getValue().includes("Soft deletion rationale")) {
		return;
	}
	const end = isMulti ? "|multi=yes}}" : "}}";
	this.prependRationale(
		`{{subst:Wikipedia:XFDcloser/Soft deletion rationale|1=${page}|2=${nomPageLink + end} `
	);
};

export default RationaleWidget;
// </nowiki>