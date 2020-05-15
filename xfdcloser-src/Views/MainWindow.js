import { $, mw, OO } from "../../globals";
import appConfig from "../config";
import DraggableMixin from "../Mixins/DraggableMixin";
import MainWindowController from "../Controllers/MainWindowController";
import ResultPanel from "./ResultPanel";
import OptionsPanel from "./OptionsPanel";
import TaskListPanel from "./TaskListPanel";
// <nowiki>

function MainWindow( config ) {
	MainWindow.super.call( this, config );
	DraggableMixin.call( this, config );
}
OO.inheritClass( MainWindow, OO.ui.ProcessDialog );
OO.mixinClass( MainWindow, DraggableMixin );

MainWindow.static.name = "main";
MainWindow.static.title = $("<span>").css({"font-weight":"normal"}).append(
	$("<a>").css({"font-weight": "bold"}).attr({"href": mw.util.getUrl("WP:XFDC"), "target": "_blank"}).text("XFDcloser"),
	" (",
	$("<a>").attr({"href": mw.util.getUrl("WT:XFDC"), "target": "_blank"}).text("talk"),
	") ",
	$("<span>").css({"font-size":"90%"}).text("v"+appConfig.script.version)
);
MainWindow.static.size = "large";
MainWindow.static.actions = [
	// Primary actions (top right):
	{
		action: "savePrefs",
		label: "Update",
		flags: ["primary", "progressive"],
		modes: "prefs" 
	},
	{
		action: "next",
		label: "Next",
		title: "Next",
		flags: ["primary", "progressive"],
		modes: ["normal", "multimodeAvailable", "multimodeActive"]
	},
	{
		action: "save",
		label: "Save",
		title: "Close discussion and implement selected actions",
		flags: ["primary", "progressive"],
		modes: ["relist", "basic", "options"]
	},
	{
		action: "finish",
		label: "Close",
		title: "Close",
		flags: ["primary", "progressive"],
		modes: "tasks",
		disabled: true
	},
	// Safe actions (top left)
	{
		action: "closePrefs",
		label: "Cancel",
		flags: "safe",
		modes: "prefs"
	},
	{
		label: "Cancel",
		title: "Cancel",
		flags: "safe",
		modes: ["normal", "relist", "basic", "multimodeAvailable", "multimodeActive"]
	},
	{
		action: "back",
		label: "Back",
		title: "Back",
		flags: "safe",
		modes: "options"
	},
	{
		action: "abort",
		label: "Abort",
		title: "Abort",
		flags: ["safe", "destructive"],
		modes: "tasks"
	},
	// Other actions (bottom left)
	{
		action: "showPrefs",
		label: "Preferences",
		title: "Preferences",
		icon: "settings",
		flags: "safe",
		modes: ["normal", "relist", "basic", "multimodeAvailable", "multimodeActive"]
	},
	{
		action: "multimode",
		label: "Multiple results...",
		modes: ["multimodeAvailable"]
	},
	{
		action: "singlemode",
		label: "Single result...",
		modes: ["multimodeActive"]
	}
];

MainWindow.prototype.setErrorsLabels = function(labels) {
	labels = labels || {};
	this.$errorsTitle.text(labels.title || "Something went wrong...");
	// Allow the "dismiss" action label to be changed to be more inituitive.
	// E.g. for recoverable warnings, it is not obvious that "dismiss" will
	// halt the process (rather than dismiss the warning).
	this.dismissButton.setLabel(labels.dismiss || "Dismiss");
};

// Customize the initialize() function: This is where to add content not dependant on data passed at time of opening
MainWindow.prototype.initialize = function () {
	// Call the parent method.
	MainWindow.super.prototype.initialize.call( this );

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

// Override the getBodyHeight() method to specify a custom height
MainWindow.prototype.getBodyHeight = function () {
	return $(".oo-ui-processDialog-errors").get(0).scrollHeight || this.model.height;
};

// Use getSetupProcess() to set up the window with data passed to it at the time 
// of opening
/**
 * @param {Object} data
 * @param {Discussion} data.discussion
 * @param {Venue} data.venue
 * @param {Object} data.user user data based on mw.config values
 * @param {String} data.type "relist" or "close"
 */
MainWindow.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	if (!data.preferences) {
		data.preferences = {};
	}
	return MainWindow.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			this.makeDraggable();
			this.model = data.model;

			this.resultPanel = new ResultPanel({
				data: {name: "resultPanel"},
				padded: true
			}, this.model.result);
			this.optionsPanel = new OptionsPanel({
				data: {name: "optionsPanel"},
				padded: true,
				$overlay: this.$overlay
			}, this.model.options);
			this.taskListPanel = new TaskListPanel({
				data: {name: "taskListPanel"},
				padded: true,
			}, this.model.taskList);

			this.stackLayout.clearItems();
			this.stackLayout.addItems([
				this.resultPanel,
				this.optionsPanel,
				this.taskListPanel
			]);

			this.controller = new MainWindowController(this.model, this);
			this.controller.updateFromModel();
		}, this );
};

// Set up the window once it is ready: attached to the DOM, and opening animation completed
MainWindow.prototype.getReadyProcess = function ( data ) {
	data = data || {};
	return MainWindow.super.prototype.getReadyProcess.call( this, data )
		.next( () => { /* TODO: Set focus */ } );
};

// Use the getActionProcess() method to do things when actions are clicked
MainWindow.prototype.getActionProcess = function (action) {
	// Do nothing; will be handled by controller
	return this.controller.getActionProcess(action);// new OO.ui.Process();
};

/**
 * Overrides OO.ui.Dialog.prototype.onActionClick to allow abort actions to occur
 * even if in a pending state.
 */ 
MainWindow.prototype.onActionClick = function ( action ) {
	if ( !this.isPending() || action.getAction() === "abort" ) {
		this.executeAction( action.getAction() );
	}
};

/**
 * Overrides OO.ui.ProcessDialog.prototype.showErrors, to also resize window
 */
MainWindow.prototype.showErrors = function ( errors ) {
	MainWindow.super.prototype.showErrors.call(this, errors);
	this.updateSize();
};

// Use the getTeardownProcess() method to perform actions whenever the dialog is closed.
// `data` is the data passed into the window's .close() method.
MainWindow.prototype.getTeardownProcess = function ( data ) {
	return MainWindow.super.prototype.getTeardownProcess.call( this, data )
		.first( () => {
			this.removeDraggability();
		} );
};

// MainWindow.prototype.setPreferences = function(prefs) {
// 	this.preferences = $.extend({}, defaultPrefs, prefs);
// 	// Apply preferences to existing items in the window:
// 	this.resultForm.setPreferences(this.preferences);
// 	this.prefsForm.setPrefValues(this.preferences);
// };


export default MainWindow;
// </nowiki>