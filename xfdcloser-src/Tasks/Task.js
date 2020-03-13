// <nowiki>
import API, {extendMwApi} from "../api";

/**
 * @class Task
 * @abstract
 * @param {Object} config
 * @param {mw.Title[]} config.pages Pages for this task
 * @param {Object} config.options Options for this task: {String}optionName, {*}optionValue pairs
 * @param {mw.Api} [config.api] mw.Api object, if not using XFDcloser's default API object
 */
function Task(config) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
    Task.super.call( this, config );
    
    this.api = config.api ? extendMwApi(config.api) : API;
    
}
OO.inheritClass( Task, OO.ui.Widget );

export default TaskGroup;
// </nowiki>