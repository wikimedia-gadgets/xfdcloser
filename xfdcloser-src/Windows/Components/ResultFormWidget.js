import NoteWidget from "./NoteWidget";
import ResultWidget from "./ResultWidget";
import RationaleWidget from "./RationaleWidget";
// <nowiki>

/**
 * @class ResultFormWidget
 * @description Base class for result form, with common elements for the more specifc result form classes.
 * @param {Object} config
 * @param {String} config.sectionHeader Discussion section header
 * @param {Boolean} config.isBasicMode
 * @param {mw.Title[]} config.pages mw.Title objects for each nominated page
 * 
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
			noteContent: "<ul>" + config.pages.map(page => "<li>" + page.getPrefixedText() + "</li>") + "</ul>"
		});
	this.fieldset.addItems([
	]);

	// Result - single result
	this.resultWidget = new ResultWidget({
		pages: config.pages,
		venue: config.venue,
		isSysop: config.user.isSysop
	});

	// Result - multiple results

	// Rationale
	this.rationale = new RationaleWidget({});

	// Options

	// Preview


	
	this.fieldset.addItems([
		new OO.ui.FieldLayout( this.discussionNote, {
			//label: 'Notice',
			align:"top"
		} ),
		new OO.ui.FieldLayout( this.resultWidget, {
			label: $("<strong>").text("Result"),
			align:"top"
		} ),
		new OO.ui.FieldLayout( this.rationale, {
			align:"top"
		} )
	]);

	this.$element.append("Result form goes here");
}
OO.inheritClass( ResultFormWidget, OO.ui.Widget );

ResultFormWidget.prototype.clearAll = () => console.log("ResultFormWidget", "clearAll"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setPreferences = () => console.log("ResultFormWidget", "setPreferences"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setPages = () => console.log("ResultFormWidget", "setPages"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setType = () => console.log("ResultFormWidget", "setType"); //TODO: Replace stub with working function

export default ResultFormWidget;
// </nowiki>