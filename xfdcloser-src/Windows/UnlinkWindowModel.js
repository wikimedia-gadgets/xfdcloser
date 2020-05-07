// <nowiki>

/**
 * Model for UnlinkWindow
 *
 * @param {Object} config
 * @param {String} [config.summary] Initial summary
 * @param {String} config.pageName Name of page to be unlinked
 * @param {String} config.advert Advert for edit summary
 * @param {mw.Api} config.api
 */
class UnlinkWindowModel {
	constructor() {
		this.mode = "initial";
		this.actionAbilities = {
			start: false,
			close: false,
			abort: false,
		};
		this.viewName = "summary";
		this.summary = "";
		// call mixin constructor
		OO.EventEmitter.call(this);
	}
	setSummary(summary) {
		this.summary = summary;
	}
	startTask() {
		this.viewName = "task";
		this.mode = "task";
		this.actionAbilities.abort = true;
		this.emit("update");
		this.emit("startTask", this.summary);
	}
	setTaskEnded() {
		this.actionAbilities.abort = false;
		this.actionAbilities.close = true;
		this.emit("update");
	}
	setTaskAborted() {
		this.emit("aborted");
		this.setTaskEnded();
	}
	setStartability(canStart) {
		this.actionAbilities.start = canStart;
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
