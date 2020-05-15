import { mw, OO } from "../../globals";
import TaskItem from "./TaskItem";
import Discussion from "./Discussion";
import Venue from "../Venue";
import UnlinkSummary from "./UnlinkSummary";
// <nowiki>

/**
 * Model for UnlinkWindow
 */
class UnlinkWindowModel {
	/**
	 * 
	 * @param {Object} config
	 *  @param {String} config.pageName Name of page to be unlinked
	 *  @param {String} [config.summary] Initial summary, default is an empty string
	 */
	constructor(config) {
		// call mixin constructor
		OO.EventEmitter.call(this);

		this.mode = "initial";
		this.currentPanel = "summary";
		this.pageName = config.pageName;

		// Models
		this.summary = new UnlinkSummary({
			summary: config.summary
		});
		this.task = new TaskItem({
			taskName: "UnlinkBacklinks",
			relaventPageNames: [this.pageName],
			discussion: new Discussion({
				venue: Venue.newFromPageName(this.pageName),
				pages: [mw.Title.newFromText(this.pageName)]
			})
		});

		this.summary.connect(this, {
			update: "onSummaryUpdate",
			inputEnter: "startTask"
		});
		this.task.connect(this, {update: ["emit", "update"]});
	}

	get canClose() {
		return this.currentPanel === "summary" || !this.task.canAbort;
	}

	get actionAbilities() {
		return {
			start: this.summary.summaryIsValid,
			abort: this.task.canAbort,
			close: !this.task.canAbort
		};
	}

	onSummaryUpdate() {
		this.task.summary = this.summary.value;
		this.emit("update");
	}
	startTask() {
		this.currentPanel = "task";
		this.mode = "task";
		this.task.start();
	}
	abortTask() {
		this.task.setAborted();
	}
}

OO.initClass( UnlinkWindowModel );
OO.mixinClass( UnlinkWindowModel, OO.EventEmitter );

export default UnlinkWindowModel;
// </nowiki>
