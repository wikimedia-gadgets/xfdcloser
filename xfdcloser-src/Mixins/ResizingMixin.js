import { OO } from "../../globals";
// <nowiki>

/**
 * A mixin to for emitting `resize` events. Adds an "emitResize" function to the prototype.
 */
function ResizingMixin(/* config */) {}
OO.initClass( ResizingMixin );

ResizingMixin.prototype.emitResize = function() {
	this.emit("resize");
};

export default ResizingMixin;
// </nowiki>