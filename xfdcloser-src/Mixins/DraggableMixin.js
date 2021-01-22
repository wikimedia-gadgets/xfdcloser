import { $, OO } from "../../globals";
// <nowiki>

// Note: CSS overrides OOUI window manager preventing background scrolling/interaction

/**
 * A mixin to for making ProcessDialogs draggable.
 */
function DraggableMixin(/* config */) {}
OO.initClass( DraggableMixin );

/**
 * Sets up the styles to enable dragability. Should be called at the
 * time of window opening, prior to being attached to the DOM (i.e.
 * during #getSetupProcess).
 */
DraggableMixin.prototype.setupDraggablityStyles = function() {
	$("body").addClass("ooui-draggbleWindow-open");
};

/**
 * Sets up dialog draggabiliy. Should be called once the window is ready
 * and attached to the DOM (i.e. during #getReadyProcess).
 * 
 * @param {number} [xi] initial horizontal offset
 * @param {number} [yi] initial vertical offset
 */
DraggableMixin.prototype.makeDraggable = function(xi, yi) {
	$("body").addClass("ooui-draggbleWindow-open");

	let $frameEl = this.$element.find(".oo-ui-window-frame");
	let $handleEl = this.$element.find(".oo-ui-processDialog-location").css({"cursor":"move"});
	
	// Position for css translate transformations, relative to initial position when
	// no css transformation has been applied (centered on viewport when scrolled to top)
	let position = {
		x: xi || 0,
		y: yi || 0
	};

	// Set intiatial offsets, if any
	if (xi || yi) {
		$frameEl.css("transform", `translate(${position.x}px, ${position.y}px)`);
		// Scroll by the initial offset amounts
		window.scrollTo(position.x, position.y);
	}

	const constrain = function(val, minVal, maxVal) {
		if (val < minVal) return minVal;
		if (val > maxVal) return maxVal;
		return val;
	};
	const constrainX = (val) => {
		// Don't got too far horizontally (leave at least 100px visible)
		let limit = window.innerWidth/2 + $frameEl.outerWidth()/2 - 100;
		return constrain(val, -1*limit, limit);
	};
	const constrainY = (val) => {
		// Can't take title bar off the viewport, since it's the drag handle
		let minLimit = -1*(window.innerHeight - $frameEl.outerHeight())/2;
		// Don't go too far down the page: (whole page height) - (initial position)
		let maxLimit = (document.documentElement||document).scrollHeight - window.innerHeight/2;
		return constrain(val, minLimit, maxLimit);
	};

	let pointerdown = false;
	let dragFrom = {};

	let onDragStart = event => {
		pointerdown = true;
		dragFrom.x = event.clientX;
		dragFrom.y = event.clientY;
	};
	let onDragMove = event => {
		if (!pointerdown || dragFrom.x == null || dragFrom.y === null) {
			return;
		}
		const dx = event.clientX - dragFrom.x;
		const dy = event.clientY - dragFrom.y;
		dragFrom.x = event.clientX;
		dragFrom.y = event.clientY;
		position.x = constrainX(position.x + dx);
		position.y = constrainY(position.y + dy);
		$frameEl.css("transform", `translate(${position.x}px, ${position.y}px)`);
	};
	let onDragEnd = () => {
		pointerdown = false;
		delete dragFrom.x;
		delete dragFrom.y;
		// Make sure final positions are whole numbers
		position.x = Math.round(position.x);
		position.y = Math.round(position.y);
		$frameEl.css("transform", `translate(${position.x}px, ${position.y}px)`);
	};

	// Use pointer events if available; otherwise use mouse events
	const pointer = ("PointerEvent" in window) ? "pointer" : "mouse";
	$handleEl.on(pointer+"enter.oouiDraggableWin", () => $frameEl.css("will-change", "transform") ); // Tell browser to optimise transform
	$handleEl.on(pointer+"leave.oouiDraggableWin", () => { if (!pointerdown) $frameEl.css("will-change", ""); } ); // Remove optimisation if not dragging
	$handleEl.on(pointer+"down.oouiDraggableWin", onDragStart);
	$("body").on(pointer+"move.oouiDraggableWin", onDragMove);
	$("body").on(pointer+"up.oouiDraggableWin", onDragEnd);
};

/**
 * Removes draggability styles and event listeners. Should be called when
 * window is closing (i.e. during #getTeardownProcess) 
 */
DraggableMixin.prototype.removeDraggability = function() {
	$("body").removeClass("ooui-draggbleWindow-open");

	this.$element.find(".oo-ui-window-frame").css("transform","");
	this.$element.find(".oo-ui-processDialog-location").off(".oouiDraggableWin");
	$("body").off(".oouiDraggableWin");
};

export default DraggableMixin;
// </nowiki>