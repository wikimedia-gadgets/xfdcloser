import OptionsWidget from "./OptionsWidget";
import config from "../../config";
// <nowiki>

/**
 * 
 * @param {Object} config
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {Boolean} config.isSysop
 * @param {jQuery} config.$overlay element for overlays
 */
function OptionsGroupWidget(config) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	OptionsGroupWidget.super.call( this, config );
	// Mixin constructor
	OO.ui.mixin.GroupElement.call( this, $.extend( {
		$group: this.$element
	}, config ) );

	this.venue = config.venue;
	this.isSysop = config.isSysop;
	this.isMultimode = false;
}
OO.inheritClass( OptionsGroupWidget, OO.ui.Widget );
OO.mixinClass( OptionsGroupWidget, OO.ui.mixin.GroupElement );

/**
 * @param {Object|Object[]} results results to show options for
 */
OptionsGroupWidget.prototype.showOptions = function(results, isMultimode) {
	if (!Array.isArray(results)) {
		results = [results];
	}
	if (this.isMultimode !== isMultimode) {
		// Clear all options
		this.clearItems();
		this.isMultimode = isMultimode;
	} else {
		// Remove any options that should no longer be shown
		this.items.forEach(item => {
			if (!results.find(resultData => resultData.result === item.getData().resultData.result)) {
				this.removeItems([item]);
			}
		});
	}
	// Add options that aren't there already	
	results.forEach(resultData => {
		if (!this.items.find(item => item.getData().resultData.result === resultData.result)) {
			this.addItems(new OptionsWidget({
				label: isMultimode && `"${resultData.result.slice(0,1).toUpperCase() + resultData.result.slice(1)}" options`,
				resultData: resultData,
				venue: this.venue,
				isSysop: this.isSysop,
				$overlay: config.$overlay
			}));
		}
	});
	// Emit resize event
	this.emit("resize");
};

export default OptionsGroupWidget;
// </nowiki>