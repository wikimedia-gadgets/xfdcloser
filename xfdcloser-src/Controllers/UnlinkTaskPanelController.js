// <nowiki>
class UnlinkTaskPanelController {
	constructor(model, widgets) {
		// Models
		this.model = model;
		// Widget
		this.task = widgets.task;
		// Connect models and widget
		this.model.connect(this, {
			update: "updateFromModel"
		});
		this.task.connect(this, {
			starting: "onTaskStarting",
			started: "onTaskStarted",
			abort: "onAbort",
			completed: "onTaskCompleted",
			resize: "onTaskResize"
		});
		this._taskStartCalled = false;
	}
	updateFromModel() {
		this.task.summaryReason = this.model.summary;
		if (this.model.aborted && !this.task.aborted) {
			this.task.abort();
		}
		if (this.model.startRequested && !this._taskStartCalled) {
			this._taskStartCalled = true;
			this.task.start();
		}
	}
	onTaskStarting() {
		this.model.setStarting();
	}
	onTaskStarted() {
		this.model.setStarted();
	}
	onAbort() {
		this.model.abortTask();
	}
	onTaskCompleted() {
		this.model.setCompleted();
	}
	onTaskResize() {
		this.model.requestResize();
	}
}

export default UnlinkTaskPanelController;
// </nowiki>
