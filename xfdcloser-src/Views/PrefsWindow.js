import { $, mw, OO } from "../../globals";
import appConfig from "../config";
import PrefsPanel from "./PrefsPanel";
import DraggableMixin from "../Mixins/DraggableMixin";
import PrefsWindowModel from "../Models/PrefsWindowModel";
import PrefsWindowController from "../Controllers/PrefsWindowController";
// <nowiki>

function PrefsWindow( config ) {
	PrefsWindow.super.call( this, config );
	DraggableMixin.call( this, config );
}
OO.inheritClass( PrefsWindow, OO.ui.ProcessDialog );
OO.mixinClass( PrefsWindow, DraggableMixin );

PrefsWindow.static.name = "prefs";
PrefsWindow.static.title = () => $("<span>").css({"font-weight":"normal"}).append(
	$("<a>").css({"font-weight": "bold"}).attr({"href": mw.util.getUrl("WP:XFDC"), "target": "_blank"}).text("XFDcloser"),
	" (",
	$("<a>").attr({"href": mw.util.getUrl("WT:XFDC"), "target": "_blank"}).text("talk"),
	") ",
	$("<span>").css({"font-size":"90%"}).text("v"+appConfig.script.version)
);
PrefsWindow.static.size = "large";
PrefsWindow.static.actions = [
	// Primary action (top right):
	{
		action: "savePrefs",
		label: "Update",
		flags: ["primary", "progressive"]
	},
	// Safe action (top left)
	{
		label: "Close",
		flags: "safe"
	},
	// Other actions (bottom left)
	{
		action: "defaultPrefs",
		label: "Restore defaults",
		title: "Restore default preferences",
		flags: "safe"
	}
];


// Customize the initialize() function: This is where to add content to the dialog body and set up event handlers.
PrefsWindow.prototype.initialize = function () {
	// Call the parent method.
	PrefsWindow.super.prototype.initialize.call( this );

	this.stackLayout = new OO.ui.StackLayout( {
		padded: false,
		expanded: false
	} );

	this.$body.append( this.stackLayout.$element );

	// Handle certain keyboard events. Requires something in the window to be focused,
	// so add a tabindex to the body and it's parent container.
	this.$body.attr("tabindex", "999")
		.parent().attr("tabindex", "999").keydown(function( event ) {
			let scrollAmount;
			switch(event.which) {
			case 33: // page up
				scrollAmount = this.$body.scrollTop() - this.$body.height()*0.9;
				break;
			case 34: // page down
				scrollAmount = this.$body.scrollTop() + this.$body.height()*0.9;
				break;
			default:
				return;
			}
			this.$body.scrollTop(scrollAmount);
			event.preventDefault();
		}.bind(this));
};

PrefsWindow.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	this.setupDraggablityStyles();
	return PrefsWindow.super.prototype.getSetupProcess.call( this, data )
		.next(() => {
			this.model = new PrefsWindowModel({
				userIsSysop: data.userIsSysop
			});
			this.prefsPanel = new PrefsPanel({
				data: {name: "prefsPanel"},
				padded: true
			}, this.model.preferences);
			this.stackLayout.clearItems();
			this.stackLayout.addItems([
				this.prefsPanel
			]);

			this.controller = new PrefsWindowController(this.model, this);
			this.controller.updateFromModel();
		});
};

PrefsWindow.prototype.getReadyProcess = function ( data ) {
	data = data || {};
	return PrefsWindow.super.prototype.getReadyProcess.call( this, data )
		.next( () => {
			this.makeDraggable(0, data.offsetTop);
			// Set focus to first input
			this.prefsPanel.fieldset.items[0].fieldLayout.getField().focus();
		});
};

PrefsWindow.prototype.getActionProcess = function(action) {
	// This is handled by the controller
	return this.controller.getActionProcess(action);
};

PrefsWindow.prototype.getBodyHeight = function () {
	// This is handled by the controller (once it is defined)
	return this.controller
		? this.controller.getBodyHeight()
		: PrefsWindow.super.prototype.getBodyHeight.call(this);
};

// Use the getTeardownProcess() method to perform actions whenever the dialog is closed.
// `data` is the data passed into the window's .close() method.
PrefsWindow.prototype.getTeardownProcess = function ( data ) {
	return PrefsWindow.super.prototype.getTeardownProcess.call( this, data )
		.first( () => {
			this.removeDraggability();
		} );
};

export default PrefsWindow;