import OptionsGroupWidget from "../Components/OptionsGroupWidget";
import ResizingMixin from "../Mixins/ResizingMixin";

// <nowiki>
/**
 * @param {Object} config
 * @param {Boolean} config.isSysop
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {jQuery} config.$overlay element for overlays
 */
function OptionsFormWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	OptionsFormWidget.super.call( this, config );
	ResizingMixin.call( this, config );

	// Options
	this.optionsFieldset = new OO.ui.FieldsetLayout(/* no label */);
	this.$element.append(this.optionsFieldset.$element);
	this.options = new OptionsGroupWidget({
		venue: config.venue,
		isSysop: config.isSysop,
		$overlay: config.$overlay
	});
	this.options.connect(this, {"resize": "emitResize"});
	this.optionsFieldset.addItems(
		new OO.ui.FieldLayout( this.options, {
			align:"top"
		} )
	);
	this.options.connect(this, {"change": "validate"});

	this.validate();
}
OO.inheritClass( OptionsFormWidget, OO.ui.Widget );
OO.mixinClass( OptionsFormWidget, ResizingMixin );

OptionsFormWidget.prototype.showOptions = function(resultData, isMultimode) {
	this.options.showOptions(resultData, isMultimode);
};

OptionsFormWidget.prototype.getOptionsData = function() {
	return this.options.getValues();
};

/**
 * @returns {Promise} A promise that resolves if valid, rejects if not.
 */
OptionsFormWidget.prototype.getValidity = function() {
	return this.options.getValidity();
};

OptionsFormWidget.prototype.validate = function() {
	this.getValidity().then(
		() => this.emit("validated", true),
		() => this.emit("validated", false)
	);	
};

export default OptionsFormWidget;
// </nowiki>