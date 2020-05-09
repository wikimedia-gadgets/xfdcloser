import appConfig from "../../config";
import PrefsFormWidget from "../../Layouts/PrefsFormWidget";
import { setPrefs as ApiSetPrefs, defaultPrefs, getPrefs } from "../../prefs";
import DraggableMixin from "../../Mixins/DraggableMixin";
// <nowiki>

function PrefsWindow( config ) {
	PrefsWindow.super.call( this, config );
	DraggableMixin.call( this, config );
}
OO.inheritClass( PrefsWindow, OO.ui.ProcessDialog );
OO.mixinClass( PrefsWindow, DraggableMixin );

PrefsWindow.static.name = "prefs";
PrefsWindow.static.title = $("<span>").css({"font-weight":"normal"}).append(
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
		label: "Cancel",
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

	/* --- PREFS --- */
	this.preferences = appConfig.defaultPrefs;

	/* --- CONTENT AREA --- */

	// Preferences, filled in with current prefs upon loading.
	this.prefsForm = new PrefsFormWidget();
	this.prefsLayout = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false,
		$content: this.prefsForm.$element
	} );

	this.contentArea = new OO.ui.StackLayout( {
		items: [
			this.prefsLayout,
		],
		padded: false,
		expanded: false
	} );

	this.$body.append(this.contentArea.$element);

	/* --- EVENT HANDLING --- */

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
PrefsWindow.prototype.getBodyHeight = function () {
	var currentlayout = this.contentArea.getCurrentItem();
	var layoutHeight = currentlayout && currentlayout.$element.outerHeight(true);
	var contentHeight = currentlayout && currentlayout.$element.children(":first-child").outerHeight(true);
	return Math.max(200, layoutHeight, contentHeight);
};

PrefsWindow.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	return PrefsWindow.super.prototype.getSetupProcess.call( this, data )
		.next(
			getPrefs().then(prefs => {
				this.setPreferences(prefs || {});
				this.prefsForm.changed = false;
				return true;
			}),
			this)
		.next(
			() => {
				this.makeDraggable();
				this.updateSize();
			},
			this);
};

// Use the getActionProcess() method to do things when actions are clicked
PrefsWindow.prototype.getActionProcess = function ( action ) {
	const updatedPrefs = this.prefsForm.getPrefs();
	if ( action === "savePrefs" ) {
		return new OO.ui.Process().next(
			ApiSetPrefs(updatedPrefs).then(
				// Success
				() => {
					mw.notify("XFDcloser preferences updated.");
					this.close();
				},
				// Failure
				(code, err) => $.Deferred().reject(
					new OO.ui.Error(
						$("<div>").append(
							$("<strong style='display:block;'>").text("Could not save preferences."),
							$("<span style='color:#777'>").text( extraJs.makeErrorMsg(code, err) )
						)
					)
				)
			)
		);

	} else if ( action === "defaultPrefs" ) {
		return new OO.ui.Process().next(
			() => {
				const updatedPrefsChangedFromDefault = JSON.stringify(updatedPrefs) !== JSON.stringify(defaultPrefs);
				if (updatedPrefsChangedFromDefault) {
					this.setPreferences();
				}
				const savedPrefsDifferentFromDefault = JSON.stringify(this.preferences) !== JSON.stringify(defaultPrefs);
				this.prefsForm.changed = savedPrefsDifferentFromDefault;
			}
		);

	} else if (!action && this.prefsForm.changed) {
		// Confirm closing of dialog if there have been changes 
		return new OO.ui.Process().next(
			OO.ui.confirm("Changes made will be discarded.", {title:"Close XFDcloser?"})
				.then(confirmed => { confirmed ? this.close() : null; })
		);
	}

	return PrefsWindow.super.prototype.getActionProcess.call( this, action );
};

// Use the getTeardownProcess() method to perform actions whenever the dialog is closed.
// `data` is the data passed into the window's .close() method.
PrefsWindow.prototype.getTeardownProcess = function ( data ) {
	return PrefsWindow.super.prototype.getTeardownProcess.call( this, data )
		.first( () => {
			this.removeDraggability();
		} );
};

PrefsWindow.prototype.setPreferences = function(prefs) {
	if (!prefs) {
		this.preferences = { ...defaultPrefs };
	} else {
		this.preferences = { ...defaultPrefs, ...prefs };
	}
	this.prefsForm.setPrefValues(this.preferences);
};

export default PrefsWindow;