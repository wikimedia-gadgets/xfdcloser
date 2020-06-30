import { OO } from "../../globals";
import Result from "./Result";
import Options from "./Options";
import TaskList from "./TaskList";
import SanityChecks from "./SanityChecks";
import PrefsGroup from "./PrefsGroup";
// <nowiki>

/**
 * Model for MainWindow
 */
class MainWindowModel {
	/**
	 * Constructor
	 * 
	 * @param {Object} config
	 *  @param {Discussion} config.discussion model for discussion
	 *  @param {String} config.type "close" or "relist"
	 *  @param {Boolean} [config.quick] `true` for quickClose
	 */
	constructor(config) {
		// Call mixin constructor
		OO.EventEmitter.call(this);
		const type = config.type;
		const userIsSysop = config.discussion.userIsSysop;

		// Models
		this.discussion = config.discussion;
		this.result = new Result({
			discussion: this.discussion,
			type,
			userIsSysop
		});
		this.options = new Options({
			result: this.result,
			venue: this.discussion.venue,
			userIsSysop
		});
		this.sanityChecks = new SanityChecks({
			discussion: this.discussion,
			result: this.result,
			options: this.options
		});
		this.taskList = new TaskList({
			discussion: this.discussion,
			result: this.result,
			options: this.options,
			type,
			userIsSysop
		});
		this.preferences = new PrefsGroup({
			userIsSysop
		}); // TODO. 
		this.heights = {};

		// Other props
		this.type = config.type;
		if ( config.quick ) {
			this.mode = "tasks";
		} else if ( this.type === "relist" ) {
			this.mode = "relist";
		} else if ( this.discussion.pages.length > 1 ) {
			this.mode = "multimodeAvailable";
		} else {
			this.mode = "normal";
		}
		this.previousMode = "";
		this.currentPanel = config.quick ? "taskListPanel" : "resultPanel";
		this.userIsSysop = config.userIsSysop;

		// Emit update when view models update
		this.result.connect(this, {
			"update": ["emit", "update"],
			"resize": ["emit", "update"]
		});
		this.options.connect(this, {
			"update": ["emit", "update"],
			"itemUpdate": ["emit", "update"]
		});
		this.taskList.connect(this, {"update": ["emit", "update"]});
		this.preferences.connect(this, {
			"update": ["emit", "update"],
			"itemUpdate": ["emit", "update"],
			"resize": ["emit", "update"]
		});
	}

	get actionAbilities() {
		// Action abilities determine whether an action can be clicked, or is disabled.
		// Visibility is controlled seperately, via the mode property
		return {
			savePrefs: this.preferences.changed,
			next: this.result.isValid, 
			save: this.mode === "options" ? this.options.isValid : this.result.isValid,
			finish: this.taskList.finished || this.taskList.aborted,
			closePrefs: true,
			defaultPrefs: !this.preferences.allHaveDefaultValues(),
			back: true,
			abort: !this.taskList.finished && !this.taskList.aborted,
			showPrefs: true,
			multimode: true,
			singlemode: true 
		};
	}

	get canClose() {
		return ( this.mode !== "tasks" || this.taskList.finished || this.taskList.aborted );
	}

	/**
	 * @private
	 */
	get _heightKey() {
		return this.currentPanel + "_" + this.mode;
	}

	static defaultHeight = 200;

	/**
	 * Suggest a values for the window height with the current panel and mode.
	 * If this is only a small decrease in height, it will be ignored; otherwise
	 * the #height property (for the current panel and mode) will be changed,
	 * and a "resize" event will be emitted.
	 * @param {Number} suggestedHeight
	 */
	suggestCurrentPanelHeight(suggestedHeight) {
		const currentHeight = this.heights[this._heightKey] || MainWindowModel.defaultHeight;
		const decreaseThreshold = 50;
		const isSmallDecrease = currentHeight > suggestedHeight && (currentHeight - suggestedHeight) < decreaseThreshold;
		if ( isSmallDecrease ) {
			return;
		}
		this.heights[this._heightKey] = suggestedHeight;
		this.emit("resize");
	}
	get height() {
		return this.heights[this._heightKey] || MainWindowModel.defaultHeight;
	}

	/**
	 * @private
	 * @param {String} mode mode name, or "_previous" to use the previous mode
	 */
	_setMode(mode) {
		const currentMode = this.mode;
		const nextMode = mode === "_previous" ? this.previousMode : mode;
		// Current mode will be previous, next mode will be current
		this.previousMode = currentMode;
		this.mode = nextMode;
	}
	showPrefs() {
		this._setMode("prefs");
		this.currentPanel = "prefsPanel";
		this.emit("update");
		// Hack to fix initial sizing bug
		setTimeout(() => {
			this.heights[this._heightKey] += 15;
			this.emit("update");
		}, 100);
	}
	closePrefs() {
		this._setMode("_previous");
		this.currentPanel = "resultPanel";
		this.emit("update");
	}
	startTasks() {
		this._setMode("tasks");
		this.currentPanel = "taskListPanel";
		this.emit("update");
		this.taskList.startTasks();
		//this.taskList.start({/* TODO: Actually start the tasks */})

	}
	setMultimode(active) {
		this._setMode(`multimode${active ? "Active" : "Available"}`);
		this.result.setMultimode(active);
		this.emit("update");
	}
	showOptions() {
		this._setMode("options");
		this.currentPanel = "optionsPanel";
		this.options.onResultUpdate();
		this.emit("update");
	}
	showResult() {
		this._setMode("_previous");
		this.currentPanel = "resultPanel";
		this.emit("update");
	}
	abortTasks() {
		this.taskList.abortTasks();
	}
}

OO.initClass( MainWindowModel );
OO.mixinClass( MainWindowModel, OO.EventEmitter );

export default MainWindowModel;
// </nowiki>