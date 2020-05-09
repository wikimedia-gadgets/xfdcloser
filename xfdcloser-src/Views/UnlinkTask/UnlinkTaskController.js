// <nowiki>
class UnlinkTaskController {
	constructor(model, windowModel, widgets) {
		// Models
		this.model = model;
		this.windowModel = windowModel;
		// Widget
		this.task = widgets.task;
		// Connect models and widget
		this.model.connect(this, { update: "updateFromModel" });
		this.windowModel.connect(this, {
			abort: "onAbort",
			startTask: "onWindowStartTask"
		});
		this.task.connect(this, {
			starting: "onTaskStart",
			abort: "onAbort",
			completed: "onTaskCompleted",
			resize: "onTaskResize"
		});
	}
	updateFromModel() {
		this.task.summaryReason = this.model.summary;
		if (this.model.taskAborted && !this.task.aborted) {
			this.task.abort();
		}
		if (this.model.taskAborted || this.model.taskCompleted) {
			this.windowModel.setTaskEnded();
		}
	}
	onWindowStartTask(summary) {
		this.model.setSummary(summary);
		this.task.start();
	}
	onTaskStart() {
		this.model.setTaskStarted();
	}
	onAbort() {
		this.model.setTaskAborted();
	}
	onTaskCompleted() {
		this.model.setTaskCompleted();
	}
	onTaskResize() {
		this.windowModel.requestResize();
	}
}

export default UnlinkTaskController;
// </nowiki>