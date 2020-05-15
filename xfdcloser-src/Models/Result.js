import { $, mw, OO } from "../../globals";
import ResultItem from "./ResultItem";
import { getRelevantResults } from "../data";
import ResultList from "./ResultList";
// <nowiki>

function validateNonEmpty(value) {
	return !!value.trim();
}
function toSentenceCase(value) {
	return value.slice(0,1).toUpperCase() + value.slice(1);
}
function pageLinkNeedsColon(pageName) {
	const title = mw.Title.newFromText(pageName);
	return title && /^(File|Image|Category):.+/.test(title.getPrefixedText());
}

function makeLink(target, text) {
	if ( !text ) {
		text = target;
	}
	const url = "/wiki/" + encodeURIComponent(String(target)) // Percent-encode everything except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
		.replace(/'/g, "%27") // Percent-encode the ' character
		.replace(/%20/g, "_") // Replace percent-encoded spaces with underscores
		// Decode certain characters which are safe to use
		.replace(/%3B/g, ";").replace(/%40/g, "@").replace(/%24/g, "$").replace(/%2C/g, ",").replace(/%2F/g, "/").replace(/%3A/g, ":");
	return $("<a>").attr({
		"href": url,
		"target":"_blank"
	}).text(text);
}

class Result {
	/**
	 * Constructor
	 * 
	 * @param {Object} config
	 *  @param {Discussion} config.discussion
	 *  @param {String} config.type "close" or "relist"
	 *  @param {Boolean} config.userIsSysop
	 */
	constructor(config) {
		// call mixin constructor
		OO.EventEmitter.call(this);

		this.discussion = config.discussion;
		this.type = config.type;
		this.userIsSysop = config.userIsSysop;
		const availableResults = getRelevantResults(this.discussion.venue.type, config.userIsSysop);

		this.singleModeResult = new ResultItem({availableResults});
		this.singleModeResult.connect(this, {update: ["emit", "update"]});

		this.multimodeResults = new ResultList({availableResults, pageNames: this.discussion.pagesNames});
		this.multimodeResults.connect(this, {update: ["emit", "update"]});

		this.resultSummary = "";
		this.isMultimode = false;
		
		this.rationale = "";
		this.newSentence = true;

		this.topNotes = [];
		if ( this.discussion.pages.length === 0 ) {
			this.topNotes.push({
				name: "basicMode",
				title: `Discussion: ${this.discussion.sectionHeader} (basic mode only)`,
				content: "Nominated pages were not detected.",
				expanded: false
			});
		} else {
			const pageCount = this.discussion.pages.length === 1 ? "1 page" : `${this.discussion.pages.length} pages`;
			this.topNotes.push({
				name: "discussionPages",
				title: `Discussion: ${this.discussion.sectionHeader} (${pageCount})`,
				content: $("<ul>").append(
					this.discussion.pagesNames.map(
						pageName => $("<li>").append(makeLink(pageName))
					)
				),
				expanded: false
			});
		}
		if ( !this.userIsSysop && this.type === "close" ) {
			this.topNotes.push({
				name: "nonAdminWarning",
				title: "Take care to avoid innapropriate non-administrator closes",
				content: $("<span>").append(
					"See the ",
					makeLink("WP:NACD"),
					" guideline for advice on appropriate and inappropriate closures."
				),
				expanded: false
			});
		}
	}

	/**
	 * @param {Object[]} uniqueSelectedResults data objects for selected results
	 */
	get uniqueSelectedResults() {
		const results = [];
		const modeResults = this.isMultimode ? this.multimodeResults.getItems() : [this.singleModeResult];
		modeResults.forEach(modeResult => {
			const selectedResult = modeResult.selectedResult;
			const isDuplicate = selectedResult && results.find(result => result.name === selectedResult.name);
			if ( selectedResult && !isDuplicate ) {
				results.push(selectedResult);
			}
		});
		return results;
	}

	/**
	 * @param {String[]} uniqueSelectedResultsNames names of selected results
	 */
	get uniqueSelectedResultsNames() {
		return this.uniqueSelectedResults.map(data => data.name);
	}

	/**
	 * @param {Boolean} resultSummaryIsValid
	 */
	get resultSummaryIsValid() {
		return validateNonEmpty(this.resultSummary);
	}

	/**
	 * @param {Boolean} showNewSentenceOption
	 */
	get showNewSentenceOption() {
		return this.type === "close";
	}

	/**
	 * @param {Boolean} showResultFieldset
	 */
	get showResultFieldset() {
		return this.type === "close";
	}

	/**
	 * @param {Boolean} rationaleHeading
	 */
	get rationaleHeading() {
		return this.type === "close" ? "Rationale" : "Relist comment";
	}

	/**
	 * @param {Boolean} showCopyButton
	 */
	get showCopyButton() {
		return this.showResultFieldset && this.isMultimode;
	}

	/**
	 * @param {Boolean} isValid
	 */
	get isValid() {
		if ( this.type === "relist" ) {
			return true;
		} else if ( this.isMultimode ) {
			return (
				this.resultSummaryIsValid &&
				this.multimodeResults.getItems().every(result => result.isValid())
			);
		} else {
			return this.singleModeResult.isValid();
		}
	}

	/**
	 * @param {String} previewWikitext
	 */
	get previewWikitext() {
		if (this.type === "relist") {
			return `{{Relist|1=${this.getRelistComment()}}}`;
		} else { 
			const resultText = this.isMultimode ? this.resultSummary.trim() : this.singleModeResult.getResultText();
			const resultWikitext = resultText ? `'''${resultText}'''` : "";
			const targetWikitext = this.getFormattedTarget({prepend: " to "});
			const rationaleWikitext = this.getFormattedRationale("punctuated") || ".";
			return `The result of the discussion was ${resultWikitext}${targetWikitext}${rationaleWikitext}`;
		}
	}

	/**
	 * Trimmed rationale. For "punctuated" format, prepended with a period
	 * and/or linebreak, if required. For "escaped" format, pipes are escaped,
	 * except within templates and wikilinks.
	 * 
	 * @param {string} [format] "punctuated" or "escaped"
	 */
	getFormattedRationale(format) {
		const text = this.rationale.trim();
		if ( !text ) {
			return "";
		}
		const firstChar = text.slice(0,1);
		const needsLinebreak = firstChar === "*" || firstChar === ":" || firstChar === ";";
		if ( format === "punctuated" ) {
			const isNewSentence = this.newSentence && this.showNewSentenceOption;
			return `${isNewSentence ? "." : ""}${needsLinebreak ? "\n" : " "}${text}`;
		}
		return ( needsLinebreak ? "\n" : "" ) + ( format === "escaped"
			? text.replace(/(\|)(?!(?:[^[]*]|[^{]*}))/g, "&#124;")
			: text 
		);
	}
	getRelistComment() {
		return this.getFormattedRationale("escaped");
	}

	getFormattedResult() {
		if ( this.isMultimode ) {
			return this.resultSummary.trim();
		} else {
			return this.singleModeResult.getResultText();
		}
	}
	// Alias
	getResultText() { return this.getFormattedResult(); }

	/**
	 * @inheritdoc ResultItem.getFormattedTarget
	 */
	getFormattedTarget(format) {
		return this.isMultimode ? "" : this.singleModeResult.getFormattedTarget(format);
	}

	getResultsByPage() {
		return this.isMultimode
			? this.multimodeResults.getItems()
			: this.discussion.pagesNames.map(pageName => ResultItem.newWithPageName(
				this.singleModeResult,
				pageName
			));
	}

	setMultimode(active) {
		this.isMultimode = !!active;
		this.emit("update");
	}

	setNoteExpanded(noteName, isExpanded) {
		const noteIndex = this.topNotes.findIndex(note => note.name === noteName);
		if ( noteIndex === -1 ) {
			throw new Error(`Note ${noteName} not found`);
		}
		this.topNotes = [
			...this.topNotes.slice(0, noteIndex),
			{
				...this.topNotes[noteIndex],
				expanded: isExpanded
			},
			...this.topNotes.slice(noteIndex + 1)
		];
		this.emit("update");
	}

	setResultSummary(value) {
		if ( this.resultSummary === value ) { return false; }
		this.resultSummary = value;
		this.emit("update");
	}

	copyResultsToRationale() {
		if ( !this.isMultimode ) { return false; }
		const results = this.multimodeResults.getItems().map(result => {
			const pageLink = pageLinkNeedsColon(result.pageName)
				? `[[:${result.pageName}]]`
				: `[[${result.pageName}]]`;
			const resultText = toSentenceCase(result.getResultText());
			if (!resultText) {
				return  `*''' ''' ${pageLink}\n`;
			}
			const formattedTarget = result.showTarget && ( result.getFormattedTarget() || "[[]]" );
			return `*'''${resultText}''' ${pageLink}${formattedTarget ? " to " + formattedTarget : ""}\n`;
		}).join("");
		this.rationale = results + this.rationale;
		this.emit("update");
	}

	setRationale(value) {
		if ( this.rationale === value ) { return false; }
		this.rationale = value;
		this.emit("update");
	}

	setNewSentence(isSelected) {
		if ( this.newSentence === isSelected ) { return false; }
		this.newSentence = isSelected;
		this.emit("update");
	}
}

OO.initClass( Result );
OO.mixinClass( Result, OO.EventEmitter );

export default Result;
// </nowiki>