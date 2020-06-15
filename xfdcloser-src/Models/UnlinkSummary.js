import { OO } from "../../globals";
// <nowiki>

class UnlinkSummary{
	constructor(config) {
		// call mixin constructor
		OO.EventEmitter.call(this);

		this.summary = config.summary || "";
		this.summaryErrors = [];
		this.parsedSummary = "";
		this.parseErrors = [];
	}

	get summaryIsValid() {
		return !!this.summary.trim();
	}

	get value() {
		return this.summary.trim();
	}

	setSummary(summary) {
		if (summary === this.summary) {
			return;
		}
		this.summary = summary;
		this.summaryErrors = this.summaryIsValid
			? []
			: ["A reason is required"];
		this.emit("update");
	}

	setParsedSummary(parsedSummary) {
		if (parsedSummary === this.parsedSummary) {
			return;
		}
		this.parsedSummary = parsedSummary;
		this.parseErrors = [];
		this.emit("update");
	}

	setParseError(errorCode) {
		this.parsedSummary = "";
		this.parseErrors = [`Preview failed: ${errorCode || "unknown"} error`];
		this.emit("update");
	}

	onInputEnter() {
		if (this.summaryIsValid) {
			this.emit("inputEnter");
		}
	}

}

OO.initClass( UnlinkSummary );
OO.mixinClass( UnlinkSummary, OO.EventEmitter );

export default UnlinkSummary;
// </nowiki>