import UnlinkWindowModel from "./UnlinkWindowModel";
import UnlinkWindowController from "./UnlinkWindowController";
import UnlinkSummaryView from "../../Views/UnlinkSummary/UnlinkSummaryView";
import UnlinkTaskView from "../../Views/UnlinkTask/UnlinkTaskView";
import DraggableMixin from "../../Mixins/DraggableMixin";
import appConfig from "../../config";
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

	this.model = new UnlinkWindowModel({
		pageName: appConfig.mw.wgPageName
	});

	this.unlinkSummaryView = new UnlinkSummaryView( {
		data: {name: "summary"},
		padded: true
	}, this.model );
	this.unlinkTaskView = new UnlinkTaskView( {
		data: {name: "task"},
		padded: true,
	}, this.model );
	this.views = new OO.ui.StackLayout( {
		items: [
			this.unlinkSummaryView,
			this.unlinkTaskView
		],
		padded: false,
		expanded: false
	} );

	this.controller = new UnlinkWindowController(this.model, {
		views: this.views,
		actions: this.actions,
		window: {
			updateSize: () => this.updateSize(),
			close: () => this.close()
		}
	});

	this.$body.append( this.views.$element );	
};

UnlinkWindow.prototype.getBodyHeight = function () {
	var currentView = this.views.getCurrentItem();
	var viewHeight = currentView && currentView.$element.outerHeight(true);
	var contentHeight = currentView && currentView.$element.children(":first-child").outerHeight(true);
	return Math.max(200, viewHeight, contentHeight);
};

UnlinkWindow.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	return UnlinkWindow.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			// Set up contents based on data
			this.unlinkSummaryView.model.setSummary( data.summary || "" );
			this.controller.updateFromModel();
		}, this );
};

UnlinkWindow.prototype.getReadyProcess = function ( data ) {
	data = data || {};
	return UnlinkWindow.super.prototype.getReadyProcess.call( this, data )
		.next( () => {
			// Set focus
			this.unlinkSummaryView.summaryInput.focus();
		});
};


export default UnlinkWindow;
// </nowiki>