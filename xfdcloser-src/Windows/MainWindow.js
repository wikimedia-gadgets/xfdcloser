import appConfig from "../config";
import ResultFormWidget from "./Layouts/ResultFormWidget";
import PrefsFormWidget from "./Layouts/PrefsFormWidget";
import OptionsFormWidget from "./Layouts/OptionsFormWidget";
import TaskFormWidget from "./Layouts/TaskFormWidget";
import { setPrefs as ApiSetPrefs, defaultPrefs } from "../prefs";
// <nowiki>

function MainWindow( config ) {
	MainWindow.super.call( this, config );
}
OO.inheritClass( MainWindow, OO.ui.ProcessDialog );

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
		modes: ["relist", "options"]
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
		modes: ["normal", "relist", "multimodeAvailable", "multimodeActive"]
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
		modes: ["normal", "relist", "multimodeAvailable", "multimodeActive"] // available when current mode isn't "prefs"
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

// Customize the initialize() function: This is where to add content to the dialog body and set up event handlers.
MainWindow.prototype.initialize = function () {
	// Call the parent method.
	MainWindow.super.prototype.initialize.call( this );

	/* --- PREFS --- */
	this.preferences = appConfig.defaultPrefs;

	/* --- MODE HANDLING --- */
	this.modes = {};

	/* --- CONTENT AREA --- */

	// Pages added dynamically upon opening, so just need a layout
	this.resultLayout = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false
	} );

	this.optionsLayout = new OO.ui.PanelLayout({
		padded: true,
		expanded: false
	});

	this.tasksLayout = new OO.ui.PanelLayout({
		padded: true,
		expanded: false
	});

	// Preferences, filled in with current prefs upon loading.
	this.prefsForm = new PrefsFormWidget();
	this.prefsLayout = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false,
		$content: this.prefsForm.$element
	} );

	this.contentArea = new OO.ui.StackLayout( {
		items: [
			this.resultLayout,
			this.prefsLayout,
			this.optionsLayout,
			this.tasksLayout
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

MainWindow.prototype.makeDraggable = function() {
	let $frameEl = this.$element.find(".oo-ui-window-frame");
	let $handleEl = this.$element.find(".oo-ui-processDialog-location").css({"cursor":"move"});
	// Position for css translate transformations, relative to initial position
	// (which is centered on viewport when scrolled to top)
	let position = { x: 0, y: 0 };
	const constrain = function(val, minVal, maxVal) {
		if (val < minVal) return minVal;
		if (val > maxVal) return maxVal;
		return val;
	};
	const constrainX = (val) => {
		// Don't got too far horizontally (leave at least 100px visible)
		let limit = window.innerWidth/2 + $frameEl.outerWidth()/2 - 100;
		return constrain(val, -1*limit, limit);
	};
	const constrainY = (val) => {
		// Can't take title bar off the viewport, since it's the drag handle
		let minLimit = -1*(window.innerHeight - $frameEl.outerHeight())/2;
		// Don't go too far down the page: (whole page height) - (initial position)
		let maxLimit = (document.documentElement||document).scrollHeight - window.innerHeight/2;
		return constrain(val, minLimit, maxLimit);
	};

	let pointerdown = false;
	let dragFrom = {};

	let onDragStart = event => {
		pointerdown = true;
		dragFrom.x = event.clientX;
		dragFrom.y = event.clientY;
	};
	let onDragMove = event => {
		if (!pointerdown || dragFrom.x == null || dragFrom.y === null) {
			return;
		}
		const dx = event.clientX - dragFrom.x;
		const dy = event.clientY - dragFrom.y;
		dragFrom.x = event.clientX;
		dragFrom.y = event.clientY;
		position.x = constrainX(position.x + dx);
		position.y = constrainY(position.y + dy);
		$frameEl.css("transform", `translate(${position.x}px, ${position.y}px)`);
	};
	let onDragEnd = () => {
		pointerdown = false;
		delete dragFrom.x;
		delete dragFrom.y;
		// Make sure final positions are whole numbers
		position.x = Math.round(position.x);
		position.y = Math.round(position.y);
		$frameEl.css("transform", `translate(${position.x}px, ${position.y}px)`);
	};

	// Use pointer events if available; otherwise use mouse events
	const pointer = ("PointerEvent" in window) ? "pointer" : "mouse";
	$handleEl.on(pointer+"enter.xfdcMainWin", () => $frameEl.css("will-change", "transform") ); // Tell browser to optimise transform
	$handleEl.on(pointer+"leave.xfdcMainWin", () => { if (!pointerdown) $frameEl.css("will-change", ""); } ); // Remove optimisation if not dragging
	$handleEl.on(pointer+"down.xfdcMainWin", onDragStart);
	$("body").on(pointer+"move.xfdcMainWin", onDragMove);
	$("body").on(pointer+"up.xfdcMainWin", onDragEnd);
};

// Override the getBodyHeight() method to specify a custom height
MainWindow.prototype.getBodyHeight = function () {
	var currentlayout = this.contentArea.getCurrentItem();
	var layoutHeight = currentlayout && currentlayout.$element.outerHeight(true);
	var contentHeight = currentlayout && currentlayout.$element.children(":first-child").outerHeight(true);
	return Math.max(200, layoutHeight, contentHeight);
};

/**
 * Set actions mode while keeping track of previous and current modes
 * @param {String} mode mode to be set, or "_previous" to use the previous mode 
 */
MainWindow.prototype.setMode = function(mode) {
	// Get the previous, current, and next modes
	const previousMode = this.modes.previous;
	const currentMode = this.modes.current;
	const nextMode = mode === "_previous" ? previousMode : mode;
	// Current mode will be previous, next mode will be current
	this.modes = {
		previous: currentMode,
		current: nextMode
	};
	// Set mode
	this.actions.setMode(nextMode);

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
	data.preferences = $.extend({}, defaultPrefs, data.preferences||{});
	return MainWindow.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			this.makeDraggable();

			// Set mode
			if (data.type === "relist") {
				this.setMode("relist");
			} else if (
				data.type === "close" &&
				!data.discussion.isBasicMode() &&
				data.discussion.pages &&
				data.discussion.pages.length > 1
			) {
				this.setMode("multimodeAvailable");
			} else {
				this.setMode("normal");
			}

			// Set up result form
			// TODO: differentiate between close and relist
			this.resultForm = new ResultFormWidget({
				sectionHeader: data.discussion.sectionHeader,
				isBasicMode: data.discussion.isBasicMode(),
				pages: data.discussion.pages || [],
				venue: data.venue.type,
				user: data.user,
				type: data.type,
				$overlay: this.$overlay 
			});
			// Add to layout and update
			this.resultLayout.$element.append( this.resultForm.$element );
			this.resultForm.updatePreviewAndValidate();

			if (data.type === "close") {
				this.optionsForm = new OptionsFormWidget({
					isSysop: data.user.isSysop,
					venue: data.venue.type,
					$overlay: this.$overlay
				});
				this.optionsLayout.$element.append( this.optionsForm.$element );
				this.optionsForm.connect(this, {"validated": "onOptionsValidation"});
			}

			// Set up preferences
			this.setPreferences(data.preferences || {});
			// Force a size update to ensure eveything fits okay
			this.updateSize();

			this.resultForm.connect(this, {
				"resize": "updateSize",
				"showOptions": "onShowOptions",
				"validated": "onResultValidation"
			});
		}, this );
};

// Set up the window it is ready: attached to the DOM, and opening animation completed
MainWindow.prototype.getReadyProcess = function ( data ) {
	data = data || {};
	return MainWindow.super.prototype.getReadyProcess.call( this, data )
		.next( () => { /* TODO: Set focus */ } );
};

// Use the getActionProcess() method to do things when actions are clicked
MainWindow.prototype.getActionProcess = function ( action ) {
	if ( action === "showPrefs" ) {
		this.setMode("prefs");
		this.contentArea.setItem( this.prefsLayout );
		this.updateSize();

	} else if ( action === "savePrefs" ) {
		var updatedPrefs = this.prefsForm.getPrefs();
		return new OO.ui.Process().next(
			ApiSetPrefs(updatedPrefs).then(
				// Success
				() => {
					this.setPreferences(updatedPrefs);
					this.setMode("_previous");
					this.contentArea.setItem( this.resultLayout );
					this.updateSize();
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

	} else if ( action === "closePrefs" ) {
		this.setMode("_previous");
		this.contentArea.setItem( this.resultLayout );
		this.prefsForm.setPrefValues(this.preferences);
		this.updateSize();

	} else if ( action === "save" ) {
		this.setMode("tasks");
		this.taskForm = new TaskFormWidget({
			formData: this.resultForm.getResultFormData(),
			options: this.optionsForm && this.optionsForm.getOptionsData()
		});
		this.taskForm.connect(this, {"finished": "onTasksFinished"});
		this.tasksLayout.$element.append( this.taskForm.$element );
		this.contentArea.setItem( this.tasksLayout );
		this.updateSize();

	} else if ( action === "multimode" ) {
		this.setMode("multimodeActive");
		this.resultForm.toggleMultimode(true);

	} else if ( action === "singlemode" ) {
		this.setMode("multimodeAvailable");
		this.resultForm.toggleMultimode(false);

	} else if ( action === "next" ) {
		this.setMode("options");
		this.optionsForm.validate();
		this.contentArea.setItem( this.optionsLayout );
		this.updateSize();
	
	} else if ( action === "back" ) {
		this.setMode("_previous");
		this.contentArea.setItem( this.resultLayout );
		this.updateSize();

	} else if ( action === "finish" ) {
		return new OO.ui.Process().next(
			() => this.close( {success: true} )
		);

	} else if (!action && this.resultForm.changed) {
		// Confirm closing of dialog if there have been changes 
		return new OO.ui.Process().next(
			OO.ui.confirm("Changes made will be discarded.", {title:"Close XFDcloser?"})
				.then(confirmed => { confirmed ? this.close() : null; })
		);
	}

	return MainWindow.super.prototype.getActionProcess.call( this, action );
};

// Use the getTeardownProcess() method to perform actions whenever the dialog is closed.
// `data` is the data passed into the window's .close() method.
MainWindow.prototype.getTeardownProcess = function ( data ) {
	return MainWindow.super.prototype.getTeardownProcess.call( this, data )
		.first( () => {
			this.resultLayout.$element.empty();
			this.resultForm = null;
			this.optionsLayout.$element.empty();
			this.optionsForm = null;
			this.contentArea.setItem( this.resultLayout );

			this.$element.find(".oo-ui-window-frame").css("transform","");
			this.$element.find(".oo-ui-processDialog-location").off(".xfdcMainWin");
			$("body").off(".xfdcMainWin");
		} );
};

MainWindow.prototype.setPreferences = function(prefs) {
	this.preferences = $.extend({}, defaultPrefs, prefs);
	// Apply preferences to existing items in the window:
	this.resultForm.setPreferences(this.preferences);
	this.prefsForm.setPrefValues(this.preferences);
};

MainWindow.prototype.onResultValidation = function(isValid) {
	this.getActions().setAbilities({
		next: isValid,
		save: isValid
	});
};

MainWindow.prototype.onOptionsValidation = function(isValid) {
	this.getActions().setAbilities({
		save: isValid
	});
};

MainWindow.prototype.onShowOptions = function(resultData, isMultimode) {
	this.optionsForm.showOptions(resultData, isMultimode);
};

MainWindow.prototype.onTasksFinished = function() {
	this.getActions().setAbilities({
		finish: true,
		abort: false
	});
};

export default MainWindow;
// </nowiki>