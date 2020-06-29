import { OO } from "../../globals";
import PrefsPanelController from "../Controllers/PrefsPanelController";
// <nowiki>

function PrefsPanel( config, model ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	PrefsPanel.super.call( this, config );

	this.model = model;

	this.fieldset = new OO.ui.FieldsetLayout({label: "Preferences"});
	this.$element.append(this.fieldset.$element);

	this.controller = new PrefsPanelController(this.model, this);
}
OO.inheritClass( PrefsPanel, OO.ui.PanelLayout );

export default PrefsPanel;
// </nowiki>