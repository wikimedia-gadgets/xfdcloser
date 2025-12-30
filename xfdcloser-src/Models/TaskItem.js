import { OO } from "../../globals";
import appConfig from "../config";
// <nowiki>

// Value for indtertimate progress per https://doc.wikimedia.org/oojs-ui/master/js/#!/api/OO.ui.ProgressBarWidget
const indeterminateProgress = false;

class TaskItem {
	/**
	 * 
	 * @param {Object} config
	 *  @param {String} config.taskName Name of task controller
	 *  @param {String[]} [config.relaventPageNames]
	 *  @param {Discussion} config.discussion
	 *  @param {Result} config.result
	 *  @param {Options} config.options
	 */
	constructor(config) {
		// Call mixin constructor
		OO.EventEmitter.call(this);

		this.discussion = config.discussion;
		this.venue = this.discussion.venue;
		this.result = config.result;
		this.options = config.options;
		this.pageNames = config.relaventPageNames || [];
		this.taskName = config.taskName;
		this.displayName = config.displayName;
		this.summary = config.summary;
		this.warnings = [];
		this.showOverflowWarnings = false;
		this.errors = [];
		this.showOverflowErrors = false;
		this.steps = {
			total: 0,
			completed: 0,
			skipped: 0,
			failed: 0
		};
		this.starting = false;
		this.started = false;
		this.doing = false;
		this.done = false;
		this.aborted = false;
		this.failed = false;
	}
	get name() {
		return this.taskName;
	}
	get progress() {
		if ( !this.started ) {
			return 0; // i.e. empty progress bar
		} else if ( this.steps.total <= 1 ) {
			return indeterminateProgress;
		}
		return 100 * ( this.steps.completed + this.steps.skipped ) / this.steps.total;
	}
	get showProgressBar() {
		return !this.done && !this.aborted && !this.failed;
	}
	get resultsByPage() {
		return {}; // TODO... if needed
	}
	get pageNamesWithModuleDocs() {
		return this.pageNames.map(
			pageName => `${pageName}${pageName.indexOf("Module:") === 0	? "/doc" : ""}`
		);
	}
	get label() {
		const completedOutOfTotal = `${this.steps.completed}/${this.steps.total}`;
		let message;
		if ( !this.started || this.steps.total === 0 ) {
			return this.displayName;
		} else if ( this.aborted && !this.done ) {
			message = this.steps.completed
				? `Aborted (after completing ${completedOutOfTotal})`
				: "Aborted";
		} else if ( this.failed || this.steps.failed === this.steps.total ) {
			message = `Failed (completed ${completedOutOfTotal})`;
		} else if ( this.done ) {
			message = this.steps.completed
				? `Done! (${completedOutOfTotal})`
				: "Skipped" + ( this.steps.skipped ? ` (${this.steps.skipped})` : "");
		}
		return message ? `${this.displayName}: ${message}` : this.displayName;
	}
	get notices() {
		if ( this.aborted || this.done || this.failed ) {
			return [];
		} else if ( !this.started ) {
			return ["Waiting..."];
		} else if ( this.steps.total === 0 ) {
			return ["Doing..."];
		} else {
			return [`Doing... (${this.steps.completed} / ${this.steps.total})`];
		}
	}

	get canAbort() {
		return !this.done && !this.failed && !this.aborted;
	}

	/**
	 * 
	 * @param {Object} [options]
	 *  @param {String} [options.prefix] Text to insert at start
	 *  @param {Boolean} [options.short] Use a shortered form (omit the "closed as {result}" part) 
	 */
	getEditSummary(options) {
		options = options || {};
		const prefix = options.prefix ? options.prefix + " " : "";
		const main = this.summary || options.short
			? `[[${this.discussion.discussionPageLink}]]`
			: `[[${this.discussion.discussionPageLink}]] closed as ${this.result.getResultText()}`;
		return prefix + main + " " + appConfig.script.advert;
	}

	/**
	 * @returns {String[]} relevant page names with redirects resolved
	 */
	getResolvedPageNames() {
		return this.discussion.redirects.resolve(this.pageNames);
	}

	/**
	 * @returns {String[]} relevant talk page names with redirects resolved
	 */
	getResolvedTalkpagesNames() {
		return this.discussion.redirects.resolveTalks(this.pageNames);
	}

	getPageResults(resultType) {
		return this.result.getResultsByPage().filter(pageResult => {
			return this.pageNames.includes(pageResult.pageName) && (resultType ? pageResult.selectedResultName === resultType : true);
		});
	}

	/**
	 * Set the displayed name of the task
	 * @param {String} name 
	 */
	setName(name) {
		this.displayName = name;
		this.emit("update");
	}
	addWarning(message) {
		this.warnings = this.warnings.concat(message);
		this.emit("update");
	}
	addError(message) {
		this.errors = this.errors.concat(message);
		this.emit("update");
	}
	setTotalSteps(count) {
		this.steps.total = count;
		this.emit("update");
	}
	trackStep(type) {
		if (type !== "failed" && type !== "skipped") {
			type = "completed";
		}
		this.steps[type]++;
		// if ( this.steps.completed + this.steps.skipped + this.steps.failed === this.steps.total ) {
		// 	this.done === true;
		// }
		this.emit("update");
	}
	/**
	 * 
	 * @param {TaskItem} task Task which must preceed this task
	 * @param {String} requiredState Property name of task which must be true for this task to proceed, e.g. "done", "doing"
	 */
	setPrecedingTask(task, requiredState) {
		this.precedingTask = { task, requiredState };
		task.connect(this, { "update": "onPrecedingTaskUpdate"});
	}
	onPrecedingTaskUpdate() {
		if (this.canProceed()) {
			this.start();
		}
		this.emit("update");
	}
	canProceed() {
		if ( !this.precedingTask ) {
			return true;
		}
		const { task, requiredState } = this.precedingTask;
		return !!task[requiredState];
	} 
	start() {
		if ( this.starting ) return false;
		this.starting = true;
		this.emit("update");
	}
	setStarted() {
		if ( this.started ) return false;
		this.started = true;
		this.emit("update");
	}
	setDoing() {
		if ( this.doing ) return false;
		this.doing = true;
		this.emit("update");
	}
	setDone() {
		if ( this.done ) return false;

		if ( this.steps.completed + this.steps.skipped > 0 ) {
			this.done = true;
		} else {
			this.failed = true;
		}
		this.emit("update");
	}
	setAborted() {
		if ( !this.canAbort ) return false;
		this.aborted = true;
		this.emit("update");
	}
	setFailed() {
		if ( this.done || this.failed ) return false;
		this.failed = true;
		this.emit("update");
	}
}
OO.initClass( TaskItem );
OO.mixinClass( TaskItem, OO.EventEmitter );

export default TaskItem;
// </nowiki>
