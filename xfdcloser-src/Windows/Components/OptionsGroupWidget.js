import OptionsWidget from "./OptionsWidget";
// <nowiki>

/**
 * 
 * @param {Object} config
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {Boolean} config.isSysop
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
}
OO.inheritClass( OptionsGroupWidget, OO.ui.Widget );
OO.mixinClass( OptionsGroupWidget, OO.ui.mixin.GroupElement );

/**
 * @param {Object|Object[]} results results to show options for
 */
OptionsGroupWidget.prototype.showOptions = function(results) {
	if (!Array.isArray(results)) {
		results = [results];
	}
	// Remove any options that should no longer be shown
	this.items.forEach(item => {
		if (!results.includes(item.getData().result)) {
			this.removeItems([item]);
		}
	});
	// Add options that aren't there already	
	results.forEach(result => {
		if (!this.items.find(item => item.getData().result === result)) {
			this.addItems(new OptionsWidget({
				"resultData": result,
				"venue": this.venue,
				"isSysop": this.isSysop
			}));
		}
	});
};

export default OptionsGroupWidget;
// </nowiki>