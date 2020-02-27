import NoteWidget from "./NoteWidget";
import ResultWidget from "./ResultWidget";
import RationaleWidget from "./RationaleWidget";
import OptionsGroupWidget from "./OptionsGroupWidget";
import MultiResultGroupWidget from "./MultiResultGroupWidget";
// <nowiki>

/**
 * @class ResultFormWidget
 * @description Base class for result form, with common elements for the more specifc result form classes.
 * @param {Object} config
 * @param {String} config.sectionHeader Discussion section header
 * @param {Boolean} config.isBasicMode
 * @param {mw.Title[]} config.pages mw.Title objects for each nominated page
 * @param {Object} config.user Object with {String}sig, {string}name, {boolean}isSysop
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {jQuery} $overlay element for overlays
 */
function ResultFormWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	ResultFormWidget.super.call( this, config );

	this.fieldset = new OO.ui.FieldsetLayout();
	this.$element.append( this.fieldset.$element );

	// Top stuff
	this.discussionNote = config.isBasicMode
		? new NoteWidget({
			title: `Discussion: ${config.sectionHeader} (basic mode only)`,
			noteContent: "Nominated pages were not detected."
		})
		: new NoteWidget({
			title: `Discussion: ${config.sectionHeader} (${config.pages.length} ${config.pages.length === 1 ? "page" : "pages"})`,
			noteContent: "<ul>" + config.pages.map(page => "<li>" + page.getPrefixedText() + "</li>").join("") + "</ul>"
		});
	this.fieldset.addItems([
	]);

	// Result - single result
	this.resultWidget = new ResultWidget({
		pages: config.pages,
		venue: config.venue,
		isSysop: config.user.isSysop
	});

	// Rationale
	this.rationale = new RationaleWidget({});

	// Options
	this.options = new OptionsGroupWidget({
		venue: config.venue,
		isSysop: config.user.isSysop,
		$overlay: config.$overlay
	});
	// Preview


	this.resultWidgetField = new OO.ui.FieldLayout( this.resultWidget, {
		label: $("<strong>").text("Result"),
		align:"top"
	} );
	
	this.fieldset.addItems([
		new OO.ui.FieldLayout( this.discussionNote, {
			//label: 'Notice',
			align:"top"
		} ),
		this.resultWidgetField,
		new OO.ui.FieldLayout( this.rationale, {
			align:"top"
		} ),
		new OO.ui.FieldLayout( this.options, {
			align:"top"
		} )
	]);

	// Result - multiple results
	if (config.pages && config.pages.length > 1) {
		this.multiResultWidget = new MultiResultGroupWidget({
			pages: config.pages,
			venue: config.venue,
			isSysop: config.isSysop,
			$overlay: config.$overlay
		});
		this.multiResultWidgetField = new OO.ui.FieldLayout( this.multiResultWidget, {
			label: $("<strong>").text("Result"),
			align:"top"
		} );
		this.multiResultWidgetField.toggle(false);

		this.fieldset.addItems(this.multiResultWidgetField, 1);

		this.multiResultWidget.connect(this, {
			"resultSelect": "onResultSelect",
			"resize": "onResize"
		});
	}

	this.resultWidget.connect(this, {"resultSelect": "onResultSelect"});
	this.options.connect(this, {"resize": "onResize"});
}
OO.inheritClass( ResultFormWidget, OO.ui.Widget );

ResultFormWidget.prototype.clearAll = () => console.log("ResultFormWidget", "clearAll"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setPreferences = () => console.log("ResultFormWidget", "setPreferences"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setPages = () => console.log("ResultFormWidget", "setPages"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setType = () => console.log("ResultFormWidget", "setType"); //TODO: Replace stub with working function

ResultFormWidget.prototype.onResultSelect = function(resultData) {
	this.options.showOptions(resultData, this.isMultimode);
	this.onResize();
};

ResultFormWidget.prototype.onResize = function() {
	this.emit("resize");
};

/**
 * @param {Boolean} show `true` to show multimode, `false` for single-mode
 */
ResultFormWidget.prototype.toggleMultimode = function(show) {
	this.isMultimode = !!show;
	this.multiResultWidgetField.toggle(!!show);
	this.resultWidgetField.toggle(!show);
	if (show) {
		// Trigger options update by calling multiResultWidget's onResultChange
		this.multiResultWidget.onResultChange();
	} else {
		// Trigger options update by calling this widget's onResultSelect with currently selected result's data
		this.onResultSelect(this.resultWidget.getSelectedResultData() || []);
	}
};


export default ResultFormWidget;
// </nowiki>