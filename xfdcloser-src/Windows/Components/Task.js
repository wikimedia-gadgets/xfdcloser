// <nowiki>
/**
 * @abstract
 * @class Task
 * @param {Object} config
 * @param {mw.APi} config.api extended mw.Api object
 * @param {mw.Title[]} config.pages Pages for this task
 * @param {Object} config.options Options for this task: {String}optionName, {*}optionValue pairs
 * @param {String|jQuery} config.label label for the task
 * @param {mw.Api} [config.api] mw.Api object, if not using XFDcloser's default API object
 */
function Task(config) {
	// Configuration initialization
	config = config || {};

	// Call parent constructor
	Task.super.call( this, config );

	// Sub-widgets
	this.progressbar = new OO.ui.ProgressBarWidget({progress:0});
	this.field = new OO.ui.FieldLayout(this.progressbar, {
		label: config.label,
		$element: this.$element
	});

	this.setNotice("Waiting...");
	this.$element.find(".oo-ui-fieldLayout-messages").css("clear","both");
	
	// Store api and data
	this.api = config.api;
	this.pages = config.pages;
	this.options = config.options;

	// Warnings and errors
	this.warningsList = [];
	this.errorsList = [];

	// Tracking edits and/or other actions
	this.steps = {
		total: 0,
		completed: 0,
		failed: 0
	};
}
OO.inheritClass( Task, OO.ui.Widget );

function toSmallSnippet(content) {
	return new OO.ui.HtmlSnippet(
		`<span style="font-size: 88%; font-weight: normal;">${content}</span>`
	);
}

/**
 * @param {String} errorMessage
 * @param {Object} options
 * @param {Boolean} options.abort Abort all remaining actions and tasks
 */
Task.prototype.addError = function(errorMessage, options) {
	this.errorsList.push( toSmallSnippet(errorMessage) );
	this.field.setErrors(this.errorsList);
	if (options && options.abort) {
		this.api.abort();
		this.emit("abort");
	}
	this.emit("resize");
};

/**
 * @param {String|OO.ui.HtmlSnippet} warningMessage
 */
Task.prototype.addWarning = function(warningMessage) {
	this.warningsList.push( toSmallSnippet(warningMessage) );
	this.field.setWarnings(this.warningsList);
	this.emit("resize");
};

/**
 * @param {String|jQuery|OO.ui.HtmlSnippet} label task description
 */
Task.prototype.setLabel = function(label) {
	this.field.setLabel(label);
	this.emit("resize");
};

/**
 * @param {String|OO.ui.HtmlSnippet} notice task status notice ("Waiting", "Finished", "Failed", etc)
 */
Task.prototype.setNotice = function(notice) {
	this.field.setNotices([ toSmallSnippet(notice) ]);
	this.emit("resize");
};

/**
 * @param {Number} totalSteps
 */
Task.prototype.setTotalSteps = function(totalSteps) {
	this.steps.total = totalSteps;
	this.updateProgress();
};

/**
 * @param {Object} [state]
 * @param {Boolean} state.failed
 */
Task.prototype.trackStep = function(state) {
	if (state && state.failed) {
		this.steps.failed++;
	} else {
		this.steps.completed++;
	}
	this.updateProgress();
};

Task.prototype.updateProgress = function() {
	const progress = this.steps.total === 1
		? false /* indeterminate */
		: (this.steps.completed + this.steps.failed)/this.steps.total*100;
	this.progressbar.setProgress(progress);
	this.setNotice(`Processing... (${this.steps.completed + this.steps.failed} / ${this.steps.total})`);
};


Task.prototype.start = function() {
	this.setNotice("Processing...");
	this.doTask().then( notice => {
		this.setNotice(notice || "Done!");
		this.emit("completed");
	});
};

/**
 * Code that actually undertakes the task
 * @private
 * @virtual
 * @returns {Promise} promise resolved when task has been completed 
 */
Task.prototype.doTask = () => $.Deferred().resolve().promise();

export default Task;
// </nowiki>