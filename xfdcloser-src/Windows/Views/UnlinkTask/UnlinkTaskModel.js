// <nowiki>
/**
 * Model for UnlinkTaskView
 *
 * @param {Object} config
 * @param {String} [config.summary] Initial summary
 * @param {String} config.pageName Name of page to be unlinked
 * @param {String} config.advert Advert for edit summary
 * @param {mw.Api} config.api
 */
class UnlinkTaskModel {
	constructor(config) {
		config = config || {};
		
		this.summary = config.summary || "";
		this.pageName = config.pageName;
		this.taskStarted = false;
		this.taskAborted = false;
		this.taskCompleted = false;
		// call mixin constructor
		OO.EventEmitter.call(this);
	}
	setSummary(summary) {
		this.summary = summary;
		this.emit("update");
	}
	setTaskStarted() {
		this.taskStarted = true;
		this.emit("update");
	}
	setTaskAborted() {
		this.taskAborted = true;
		this.emit("update");
	}
	setTaskCompleted() {
		this.taskCompleted = true;
		this.emit("update");
	}
}

OO.initClass( UnlinkTaskModel );
OO.mixinClass( UnlinkTaskModel, OO.EventEmitter );

export default UnlinkTaskModel;
// </nowiki>
