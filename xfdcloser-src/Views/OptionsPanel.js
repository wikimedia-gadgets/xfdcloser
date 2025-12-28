import { $, OO } from "../../globals";
import OptionsPanelController from "../Controllers/OptionsPanelController";
// <nowiki>

/**
 * @class OptionsPanel
 * @param {Object} config
 * @param {String} config.sectionHeader Discussion section header
 * @param {Boolean} config.isBasicMode
 * @param {mw.Title[]} config.pages mw.Title objects for each nominated page
 * @param {String} config.type "close" or "relist" 
 * @param {Object} config.user Object with {String}sig, {string}name, {boolean}isSysop
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {String} config.nomPageLink Nomination page link target, with #section anchor if appropriate
 * @param {jQuery} $overlay element for overlays
 */
function OptionsPanel( config, model ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	OptionsPanel.super.call( this, config );
	// Mixin constructor
	OO.ui.mixin.GroupElement.call( this, {
		$group: $("<div>").appendTo(this.$element),
		...config
	} );

	this.model = model;

	this.$overlay = config.$overlay;

	this.controller = new OptionsPanelController(this.model, this);
	this.controller.updateFromModel();

}
OO.inheritClass( OptionsPanel, OO.ui.PanelLayout );
OO.mixinClass( OptionsPanel, OO.ui.mixin.GroupElement );

export default OptionsPanel;
// </nowiki>
