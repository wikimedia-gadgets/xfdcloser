import { $, OO } from "../../globals";
import NoteWidget from "../Components/NoteWidget";
import API from "../api";
// import { timeout } from "../util";

// <nowiki>
class ResultPanelController {
	constructor(model, widgets) {
		this.model = model;

		this.notesFieldset = widgets.notesFieldset;
		this.resultFieldset = widgets.resultFieldset;
		this.resultWidgetField = widgets.resultWidgetField;
		this.multiResultWidgetField = widgets.multiResultWidgetField;
		this.resultSummary = widgets.resultSummary,
		this.resultSummaryField = widgets.resultSummaryField,
		this.rationaleFieldset = widgets.rationaleFieldset,
		this.copyButton = widgets.copyButton;
		this.rationaleTextbox = widgets.rationaleTextbox;
		this.newSentenceOption = widgets.newSentenceOption;
		this.preview = widgets.preview;

		this.model.connect(this, {update: "updateFromModel"});
		this.resultSummary.connect(this, {change: "onResultSummaryChange"});
		this.copyButton.connect(this, {click: "onCopyButtonClick"});
		this.rationaleTextbox.connect(this, {change: "onRationaleChange"});
		this.newSentenceOption.connect(this, {change: "onNewSentenceChange"});

		this._latestPreviewWikitext = "";
		this._latestRequestId = 0;
	}

	updateFromModel() {
		this.resultFieldset.toggle(this.model.showResultFieldset);
		this.resultWidgetField.toggle(!this.model.isMultimode);
		this.multiResultWidgetField.toggle(this.model.isMultimode);
		this.resultSummaryField.toggle(this.model.isMultimode);
		this.rationaleFieldset.setLabel(this.model.rationaleHeading);
		this.copyButton.toggle(this.model.showCopyButton);
		this.rationaleTextbox.setValue(this.model.rationale);
		this.newSentenceOption.setSelected(this.model.newSentence).toggle(this.model.showNewSentenceOption);
		this.preview.$element.html(this.model.preview);

		// update notes from model
		this.notesFieldset.clearItems();
		this.notesFieldset.addItems(
			this.model.topNotes.map(note => {
				const widget = new NoteWidget({
					title: note.title,
					noteContent: note.content,
					data: {name: note.name}
				});
				widget.setExpanded(note.expanded);
				widget.connect(this, {
					expand: ["onNoteExpand", note.name],
					unexpand: ["onNoteUnexpand", note.name]
				});
				return new OO.ui.FieldLayout( widget, {
					align:"top",
					$element: $("<div>").css("margin-top", "5px")
				} );
			})
		);
		
		// update preview from model
		const wikitext = this.model.previewWikitext;
		if ( this._latestPreviewWikitext === wikitext ) {
			// Wikitext has not changed since it was last parsed 
			return;
		}
		this._latestPreviewWikitext = wikitext;
		//const wikitext = this.model.previewWikitext;
		// Update parsed preview from API, if not changed again after a short delay
		// timeout(200).then(() => {
		// 	if ( wikitext !== this.model.previewWikitext ) {
		// 		// Wikitext was changed, do not send API request
		// 		return;
		// 	}
		const requestId = ++this._latestRequestId;
		return 	API.get({
			action: "parse",
			format: "json",
			formatversion: "2",
			text: wikitext,
			prop: "text",
			pst: 1,
			disablelimitreport: 1,
			contentmodel: "wikitext"
		}).then(response => {
			if ( requestId !== this._latestRequestId || !response || !response.parse || !response.parse.text) {
				return;
			}
			//this._latestPreviewWikitext = wikitext;
			this.preview.$element.empty().html(response.parse.text);
			this.model.emit("resize"); // Trigger event so that window resizes itself
		});
		// });
	}

	onNoteExpand(noteName) {
		this.model.setNoteExpanded(noteName, true);
	}
	onNoteUnexpand(noteName) {
		this.model.setNoteExpanded(noteName, false);
	}
	onResultSelect(item) {
		this.model.selectResult(item.getData());
	}
	onSpeedyChange(isSelected) {
		this.model.setSpeedyResult(isSelected);
	}
	onSoftChange(isSelected) {
		this.model.setSoftResult(isSelected);
	}
	onDeleteFirstChange(isSelected) {
		this.model.setDeleteFirstResult(isSelected);
	}
	onTargetChange(value) {
		this.model.setTarget(value);
	}
	onCustomResultChange(value) {
		this.model.setCustomResultText(value);
	}
	onMultiResultChange(resultChange) {
		this.model.updateMultimodeResult(resultChange);
	}
	onResultSummaryChange(value) {
		this.model.setResultSummary(value);
	}
	onCopyButtonClick() {
		this.model.copyResultsToRationale();
	}
	onRationaleChange(value) {
		this.model.setRationale(value);
	}
	onNewSentenceChange(isSelected) {
		this.model.setNewSentence(isSelected);
	}

}
export default ResultPanelController;
// </nowiki>