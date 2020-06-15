import { $, mw, OO } from "../../globals";
import UnlinkWindowModel from "../Models/UnlinkWindowModel";
import UnlinkWindowController from "../Controllers/UnlinkWindowController";
import UnlinkSummaryPanel from "./UnlinkSummaryPanel";
import UnlinkTaskPanel from "./UnlinkTaskPanel";
import DraggableMixin from "../Mixins/DraggableMixin";
import appConfig from "../config";
// <nowiki>

function UnlinkWindow( config ) {
	UnlinkWindow.super.call( this, config );
	DraggableMixin.call( this, config );
}
OO.inheritClass( UnlinkWindow, OO.ui.ProcessDialog );
OO.mixinClass( UnlinkWindow, DraggableMixin );

UnlinkWindow.static.name = "unlink";
UnlinkWindow.static.title = $("<span>").css({"font-weight":"normal"}).append(
	$("<a>").css({"font-weight": "bold"}).attr({"href": mw.util.getUrl("WP:XFDC"), "target": "_blank"}).text("XFDcloser"),
	"/Unlink (",
	$("<a>").attr({"href": mw.util.getUrl("WT:XFDC"), "target": "_blank"}).text("talk"),
	") ",
	$("<span>").css({"font-size":"90%"}).text("v"+appConfig.script.version)
);
UnlinkWindow.static.size = "large";
UnlinkWindow.static.actions = [
	// Primary actions (top right):
	{
		action: "start",
		label: "Start",
		flags: ["primary", "progressive"],
		modes: "initial"
	},
	{
		action: "close",
		label: "Close",
		flags: ["primary", "progressive"],
		modes: "task",
		disabled: true
	},
	// Safe actions (top left)
	{
		label: "Cancel",
		flags: "safe",
		modes: "initial"
	},
	{
		action: "abort",
		label: "Abort",
		flags: ["safe", "destructive"],
		modes: "task"
	}
];

// Customize the initialize() function: This is where to add content to the dialog body and set up event handlers.
UnlinkWindow.prototype.initialize = function () {
	// Call the parent method.
	UnlinkWindow.super.prototype.initialize.call( this );

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

UnlinkWindow.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	return UnlinkWindow.super.prototype.getSetupProcess.call( this, data )
		.next(() => {
			this.makeDraggable();
			this.model = new UnlinkWindowModel({
				pageName: data.pageName,
				summary: data.summary
			});

			this.summaryPanel = new UnlinkSummaryPanel( {
				data: {name: "summary"},
				padded: true
			}, this.model.summary );
			this.taskPanel = new UnlinkTaskPanel( {
				data: {name: "task"},
				padded: true,
			}, this.model.task );

			this.stackLayout.clearItems();
			this.stackLayout.addItems([
				this.summaryPanel,
				this.taskPanel
			]);

			this.controller = new UnlinkWindowController(this.model, this);
			this.controller.updateFromModel();
		});
};

UnlinkWindow.prototype.getReadyProcess = function ( data ) {
	data = data || {};
	return UnlinkWindow.super.prototype.getReadyProcess.call( this, data )
		.next( () => {
			// Set focus
			this.summaryPanel.summaryInput.focus();
		});
};

// Use the getActionProcess() method to do things when actions are clicked
UnlinkWindow.prototype.getActionProcess = function(action) {
	// This is handled by the controller
	return this.controller.getActionProcess(action);
};

UnlinkWindow.prototype.getBodyHeight = function () {
	// This is handled by the controller (once it is defined)
	return this.controller
		? this.controller.getBodyHeight()
		: UnlinkWindow.super.prototype.getBodyHeight.call(this);
};

export default UnlinkWindow;
// </nowiki>