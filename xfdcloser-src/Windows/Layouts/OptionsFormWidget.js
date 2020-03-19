import OptionsGroupWidget from "../Components/OptionsGroupWidget";

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

	// Options
	this.optionsFieldset = new OO.ui.FieldsetLayout(/* no label */);
	this.$element.append(this.optionsFieldset.$element);
	this.options = new OptionsGroupWidget({
		venue: config.venue,
		isSysop: config.isSysop,
		$overlay: config.$overlay
	});
	this.options.connect(this, {"resize": "onResize"});
	this.optionsFieldset.addItems(
		new OO.ui.FieldLayout( this.options, {
			align:"top"
		} )
	);
}
OO.inheritClass( OptionsFormWidget, OO.ui.Widget );

OptionsFormWidget.prototype.onResize = function() {
	this.emit("resize");
};

OptionsFormWidget.prototype.showOptions = function(resultData, isMultimode) {
	this.options.showOptions(resultData, isMultimode);
};

OptionsFormWidget.prototype.getOptionsData = function() {
	return this.options.getValues();
};

export default OptionsFormWidget;
// </nowiki>