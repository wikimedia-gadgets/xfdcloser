// <nowiki>

/**
 * Model for UnlinkWindow
 *
 * @param {Object} config
 * @param {String} config.pageName Name of page to be unlinked
 */
class UnlinkWindowModel {
	constructor(config) {
		// Props for window
		this.mode = "initial";
		this.viewName = "summary";
		// Props for views
		this.summary = "";
		this.summaryErrors = [];
		this.parsedSummary = "";
		this.parseErrors = [];
		this.pageName = config.pageName;
		this.startRequested = false;
		this.starting = false;
		this.started = false;
		this.aborted = false;
		this.completed = false;
		// call mixin constructor
		OO.EventEmitter.call(this);
	}
	get summaryIsValid() {
		return !!this.summary.trim();
	}
	get canAbort() {
		return !this.aborted && !this.completed;
	}
	get canClose() {
		return this.aborted || this.completed;
	}
	get actionAbilities() {
		return {
			start: this.summaryIsValid,
			abort: this.canAbort,
			close: this.canClose
		};
	}
	setSummary(summary) {
		if (summary === this.summary) {
			return;
		}
		this.summary = summary;
		if (summary.trim()) {
			this.summaryErrors = [];
		} else {
			this.summaryErrors = ["A reason is required"];
		}		
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
	startTask() {
		if (this.startRequested || this.aborted) {
			return;
		}
		this.startRequested = true;
		this.viewName = "task";
		this.mode = "task";
		this.emit("update");
	}
	setStarting() {
		this.starting = true;
		this.emit("update");
	}
	setStarted() {
		this.started = true;
		this.emit("update");
	}
	setCompleted() {
		this.completed = true;
		this.emit("update");
	}
	abortTask() {
		if (this.aborted || this.completed) {
			return;
		}
		this.aborted = true;
		this.emit("update");
	}
	requestResize() {
		this.emit("resize");
	}
}

OO.initClass( UnlinkWindowModel );
OO.mixinClass( UnlinkWindowModel, OO.EventEmitter );

export default UnlinkWindowModel;
// </nowiki>
