import { OO } from "../../globals";
// <nowiki>

/**
 * A mixin to enable emitting `change` events after a delay, with subsequent events cancelling unsent delayed `change` events
 * @param {Object} config 
 * @param {Number} delay Default delay in milliseconds
 */
function DelayedChangeMixin(config) {
	config = config || {};
	this.defaultDelay = config.delay || 800;
	this.changeTimerID = 0;
}
OO.initClass( DelayedChangeMixin );

/**
 * Emit a `change` event after a delay. Any delayed `change` events not yet emitted will be cancelled.
 * @param {Number} [delay] delay in milliseconds before emitting a `change` event
 */
DelayedChangeMixin.prototype.emitDelayedChange = function(delay) {
	// If there's a timeout from a previous change, clear it
	if (this.changeTimerID) {
		clearTimeout(this.changeTimerID);
	}

	// Set a new timeout for emitting a change event
	this.changeTimerID = setTimeout(
		() => this.emit("change"),
		delay || this.defaultDelay
	);
};
/**
 * Emit a `change` event immediately. Any delayed `change` events not yet emitted will be cancelled.
 */
DelayedChangeMixin.prototype.emitChange = function() {
	if (this.changeTimerID) {
		clearTimeout(this.changeTimerID);
	}
	this.changeTimerID = 0;
	this.emit("change");
};

export default DelayedChangeMixin;
// </nowiki>
