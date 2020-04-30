import ResizingMixin from "../Mixins/ResizingMixin";
// <nowiki>

/**
 * @abstract
 * @class Task
 * @param {Object} config
 * @param {mw.Api} config.api extended mw.Api object
 * @param {Object} config.options Options for this task: {String}optionName, {*}optionValue pairs
 * @param {String|jQuery} config.label label for the task
 * @param {Discussion} config.discussion Discussion object
 * @param {object} config.appConfig App configuration, including {Venue}venue
 * @param {Object} config.result result wikitext
 * @param {Object[]|false} config.pageResults Array of objects with: {mw.Title}page, {String}resultType, {Object}options [, {object}data]
 *  where options has {String}optionName: {*}optionValue pairs, and [data] may include {String}target, {String}customResult
 * @param {Promise} [config.delayStart] delay the start of this task until this promise is resolved
 */
function Task(config) {
	// Configuration initialization
	config = config || {};

	// Call parent constructor
	Task.super.call( this, config );
	ResizingMixin.call( this, config );

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
	this.pageResults = config.pageResults;
	this.pages = config.pageResults && config.pageResults.map(pageResult => pageResult.page);
	this.options = config.options;
	this.discussion = config.discussion;
	this.appConfig = config.appConfig;
	this.venue = config.appConfig.venue;
	this.result = config.result;
	this.delayStart = config.delayStart;

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
OO.mixinClass( Task, ResizingMixin );

function toSmallSnippet(content) {
	return new OO.ui.HtmlSnippet(
		`<span style="font-size: 88%; font-weight: normal;">${content}</span>`
	);
}

/**
 * @param {String} errorMessage
 * @param {Object} [config]
 * @param {Boolean} [config.abort] Abort all remaining actions and tasks
 * @param {String} [config.code] Api error code
 * @param {jqxhr} [config.jqxhr] Api error jqxhr object
 */
Task.prototype.addError = function(errorMessage, config) {
	if (config && config.code) {
		errorMessage = extraJs.makeErrorMsg(config.code, config.error) + " – " + errorMessage;
	}
	this.errorsList.push( toSmallSnippet(errorMessage) );
	this.field.setErrors(this.errorsList);
	if (config && config.abort) {
		this.api.abort();
		this.emit("abort");
	}
	this.emitResize();
};

/**
 * @param {String|OO.ui.HtmlSnippet} warningMessage
 */
Task.prototype.addWarning = function(warningMessage) {
	this.warningsList.push( toSmallSnippet(warningMessage) );
	this.field.setWarnings(this.warningsList);
	this.emitResize();
};

/**
 * @param {String|jQuery|OO.ui.HtmlSnippet} label task description
 */
Task.prototype.setLabel = function(label) {
	this.field.setLabel(label);
	this.emitResize();
};

/**
 * @param {String|OO.ui.HtmlSnippet} notice task status notice ("Waiting", "Finished", "Failed", etc)
 */
Task.prototype.setNotice = function(notice) {
	this.field.setNotices([ toSmallSnippet(notice) ]);
	this.emitResize();
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
	const progress = (this.steps.completed + this.steps.failed)/this.steps.total*100;
	if (progress === 100) {
		this.progressbar.setProgress(100);
		return;
	}
	if (this.steps.total === 1) {
		this.progressbar.setProgress(false /* indeterminate */);
		this.setNotice("Processing...");
		return;
	}
	this.progressbar.setProgress(progress);
	this.setNotice(`Processing... (${this.steps.completed + this.steps.failed} / ${this.steps.total})`);
};

Task.prototype.start = function() {
	return $.when(this.delayStart).then( () => {
		this.setNotice("Processing...");
		return this.doTask();
	}).then( notice => {
		const currentLabel = this.field.getLabel();
		this.setLabel( $("<span>").append([
			currentLabel,
			": ",
			notice || "Done!"
		]) );
		this.progressbar.toggle(false);
		this.field.setNotices([]);
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