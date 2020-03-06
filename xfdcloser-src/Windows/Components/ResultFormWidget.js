import NoteWidget from "./NoteWidget";
import ResultWidget from "./ResultWidget";
import RationaleWidget from "./RationaleWidget";
import OptionsGroupWidget from "./OptionsGroupWidget";
import MultiResultGroupWidget from "./MultiResultGroupWidget";
import PreviewWidget from "./PreviewWidget";
// <nowiki>

/**
 * @class ResultFormWidget
 * @description Base class for result form, with common elements for the more specifc result form classes.
 * @param {Object} config
 * @param {String} config.sectionHeader Discussion section header
 * @param {Boolean} config.isBasicMode
 * @param {mw.Title[]} config.pages mw.Title objects for each nominated page
 * @param {String} config.type "close" or "relist" 
 * @param {Object} config.user Object with {String}sig, {string}name, {boolean}isSysop
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {jQuery} $overlay element for overlays
 */
function ResultFormWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	ResultFormWidget.super.call( this, config );
	this.isMultimode = false;
	this.isRelisting = config.type === "relist";

	// Top stuff
	this.notesFieldset = new OO.ui.FieldsetLayout(/* no label */);
	this.$element.append( this.notesFieldset.$element );
	this.topNotes = [
		config.isBasicMode
			? new NoteWidget({
				title: `Discussion: ${config.sectionHeader} (basic mode only)`,
				noteContent: "Nominated pages were not detected."
			})
			: new NoteWidget({
				title: `Discussion: ${config.sectionHeader} (${config.pages.length} ${config.pages.length === 1 ? "page" : "pages"})`,
				noteContent: "<ul>" + config.pages.map(page => "<li>" + page.getPrefixedText() + "</li>").join("") + "</ul>"
			})
	];
	if (!config.user.isSysop && config.type==="close") {
		this.topNotes.push( new NoteWidget({
			title: "Take care to avoid innapropriate non-administrator closes",
			content: $("<p>").append(
				"See the ",
				extraJs.makeLink("WP:NACD"),
				" guideline for advice on appropriate and inappropriate closures."
			)
		}) );
	}
	this.notesFieldset.addItems(
		this.topNotes.map(
			noteWidget => new OO.ui.FieldLayout( noteWidget, {
				/* no label, */
				align:"top"
			} )
		)
	);

	// Result
	if (config.type === "close") {
		this.resultFieldset = new OO.ui.FieldsetLayout({label: "Result"});
		this.$element.append(this.resultFieldset.$element);
		this.resultWidget = new ResultWidget({
			pages: config.pages,
			venue: config.venue,
			isSysop: config.user.isSysop
		});
		this.resultWidget.connect(this, {
			"resultSelect": "onResultSelect",
			"change": "updatePreview"
		});
		this.resultWidgetField = new OO.ui.FieldLayout( this.resultWidget, {
			/* no label, */
			align:"top"
		} );
		this.resultFieldset.addItems( this.resultWidgetField );

		// Multiple results
		if (config.pages && config.pages.length > 1) {
			this.multiResultWidget = new MultiResultGroupWidget({
				pages: config.pages,
				venue: config.venue,
				isSysop: config.user.isSysop,
				$overlay: config.$overlay
			});
			this.multiResultWidget.connect(this, {
				"resultSelect": "onResultSelect",
				"resize": "onResize",
				"change": "updatePreview"
			});
			this.multiResultWidgetField = new OO.ui.FieldLayout( this.multiResultWidget, {
				/* no label, */
				align:"top"
			} );
			this.multiResultWidgetField.toggle(false);
			this.resultFieldset.addItems(this.multiResultWidgetField, 1);
		}
	}	

	// Rationale
	this.rationaleFieldset = new OO.ui.FieldsetLayout({label: config.type === "relist" ? "Relist comment" : "Rationale"});
	this.$element.append(this.rationaleFieldset.$element);
	this.rationale = new RationaleWidget({
		relisting: config.type === "relist"
	});
	this.rationale.connect(this, {
		"copyResultsClick": "onCopyResultsClick",
		"change": "updatePreview"
	});
	this.rationaleFieldset.addItems(
		new OO.ui.FieldLayout( this.rationale, {
			align:"top"
		} )
	);

	// Preview
	this.previewFieldset = new OO.ui.FieldsetLayout({label: "Preview"});
	this.$element.append(this.previewFieldset.$element);
	this.preview = new PreviewWidget();
	this.preview.connect(this, {"resize": "onResize"});
	this.previewFieldset.addItems(
		new OO.ui.FieldLayout( this.preview, {
			align: "top"
		})
	);

	if (config.type === "close") {
		// Options
		this.optionsFieldset = new OO.ui.FieldsetLayout(/* no label */);
		this.$element.append(this.optionsFieldset.$element);
		this.options = new OptionsGroupWidget({
			venue: config.venue,
			isSysop: config.user.isSysop,
			$overlay: config.$overlay
		});
		this.options.connect(this, {"resize": "onResize"});
		this.optionsFieldset.addItems(
			new OO.ui.FieldLayout( this.options, {
				align:"top"
			} )
		);
	}	
}
OO.inheritClass( ResultFormWidget, OO.ui.Widget );

ResultFormWidget.prototype.clearAll = () => console.log("ResultFormWidget", "clearAll"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setPreferences = () => console.log("ResultFormWidget", "setPreferences"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setPages = () => console.log("ResultFormWidget", "setPages"); //TODO: Replace stub with working function
ResultFormWidget.prototype.setType = () => console.log("ResultFormWidget", "setType"); //TODO: Replace stub with working function

ResultFormWidget.prototype.onCopyResultsClick = function() {
	if (!this.isMultimode) {
		return;
	}
	const results = this.multiResultWidget.getResultsByPage()
		.map(result => {
			const data = result.data;
			if (!data) {
				return  `*''' ''' ${result.page}\n`;
			}
			const resultText = data.result === "custom"
				? (data.customResult || " ")
				: extraJs.toSentenceCase(data.result);
			const suffix = data.requireTarget ? ` to [[${result.data.target}]]`	: "";
			return `*'''${resultText}''' [[${result.page}]]${suffix}\n`;
		}).join("");
	this.rationale.prependRationale(results);
};

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
	this.rationale.setMultimode(!!show);
	if (show) {
		// Trigger options update by calling multiResultWidget's onResultChange
		this.multiResultWidget.onResultChange();
	} else {
		// Trigger options update by calling this widget's onResultSelect with currently selected result's data
		this.onResultSelect(this.resultWidget.getSelectedResultData() || []);
	}
	this.updatePreview();
};

ResultFormWidget.prototype.updatePreview = function() {
	if (this.isRelisting) {
		this.preview.setWikitext(`{{Relist|1=${this.rationale.getValue()}}}`);
		return;
	}
	const resultText = this.isMultimode ? this.multiResultWidget.getResultText() : this.resultWidget.getResultText();
	const resultWikitext = resultText ? `'''${resultText}'''` : "";
	const target = !this.isMultimode && this.resultWidget.getTargetWikitext();
	const targetWikitext =  target ? ` to  ${target}` : "";
	const rationaleWikitext = this.rationale.getValue("punctuated") || ".";
	
	this.preview.setWikitext(
		`The result of the discussion was ${resultWikitext}${targetWikitext}${rationaleWikitext}`
	);
};

export default ResultFormWidget;
// </nowiki>