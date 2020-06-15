import { $, OO } from "../../globals";
import { makeLink, rejection } from "../util";
import API from "../api";
// <nowiki>

function toSmallSnippet(content) {
	return new OO.ui.HtmlSnippet(
		`<span style="font-size: 88%; font-weight: normal;">${content}</span>`
	);
}

/**
 * @abstract
 * @class
 */
class TaskItemController {
	constructor(model, widget) {
		this.model = model;
		this.widget = widget;
		this.api = API;
		this._doingTask = false;

		this.model.connect(this, {update: "updateFromModel"});
	}

	updateFromModel() {
		this.widget.field.setLabel(
			new OO.ui.HtmlSnippet(`<span>${this.model.label}</span>`)
		);
		this.widget.progressbar.setProgress(this.model.progress);
		this.widget.progressbar.toggle(this.model.showProgressBar);
		this.widget.field.setNotices(this.model.notices.map(toSmallSnippet));
		this.widget.field.setWarnings(this.model.warnings.map(toSmallSnippet));
		this.widget.field.setErrors(this.model.errors.map(toSmallSnippet));
		this.widget.emit("update");

		if ( this.model.starting && !this._doingTask && this.model.canProceed() ) {
			this._doingTask = true;
			this.model.setStarted();
			$.when(this.doTask())
				.then(() => this.model.setDone())
				.catch(() => this.model.setFailed());
		}
	}

	/**
	 * Do the task, and return a promise that is resolved when task is done or
	 * rejected if the task is failed.
	 * @virtual
	 */
	doTask() { throw new Error("doTask method not implemented"); }

	logError(code, error) {
		console.error(`[XFDcloser/${this.model.taskName}] ${code||"unknown"}`, error);
	}

	handlePageError(code, error, title, action) {
		action = action || "edit";
		switch (code) {
		case "unexpectedTitle":
			this.model.addError(`API query result included unexpected title ${makeLink(title)}; this page will not be edited`);
			this.model.trackStep("failed");
			break;
		case "unexpectedTarget":
			this.model.addError(`API query result included unexpected target talk page ${makeLink(title)}; this page will not be edited`);
			this.model.trackStep("failed");
			break;
		case "doesNotExist":
			this.model.addError(`${makeLink(title)} does not exist, and will not be edited`);
			this.model.trackStep("failed");
			break;
		case "couldNotUpdate":
			this.model.addError(`Could not update ${makeLink(title)}: ${error.message}`);
			this.model.trackStep("failed");
			break;
		case "subjectDoesNoteExist":
			this.model.addError(`The subject page for ${makeLink(title)} does not exist; this talk page will not be edited`);
			this.model.trackStep("failed");
			break;
		case "targetIsNotModule":
			this.model.addError(`Could not redirect ${makeLink(title)} because ${error && error.target
				? makeLink(error.target)
				: "the target"
			} is not a module`);
			this.model.trackStep("failed");
			break;
		case "skipped":
			this.model.addWarning(`${makeLink(title)} skipped`);
			this.model.trackStep("skipped");
			break;
		case "skippedNoneFound":
			this.model.addWarning(`${makeLink(title)} skipped: none found`);
			this.model.trackStep("skipped");
			break;
		case "skippedNoLinks":
			this.model.addWarning(`${makeLink(title)} skipped (no direct links)`);
			this.model.trackStep("skipped");
			break;
		case "noChangesMade":
			this.model.addError(`Did not find any changes to make to ${makeLink(title)}`);
			this.model.trackStep("skipped");
			break;
		case "nominationTemplateNotFound":
			this.model.addError(`Nomination template not found on page ${makeLink(title)}`);
			this.model.trackStep("skipped");
			break;
		case "abort":
			this.model.setAborted();
			this.model.trackStep("failed");
			break;
		case "aborted":
			this.model.trackStep("failed");
			break;
		default:
			this.model.addError(`${code||"unknown"} error: could not ${action} page ${makeLink(title)}`);
			this.model.trackStep("failed");
			this.logError(code, error);
		}
	}

	handleOverallError(errortype, code, error) {
		if (errortype === "read") {
			// "write" errors already handled via #handlePageError
			this.model.addError(`${code||"unknown"} error: Could not read contents of nominated ${this.model.discussion.pages.length > 1 ? "pages" : "page"}`);
			this.model.setFailed();
			this.logError(code, error);
			return rejection();
		}
	}
}

export default TaskItemController;
// </nowiki>