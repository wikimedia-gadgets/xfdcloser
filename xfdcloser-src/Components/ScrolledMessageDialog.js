import { OO } from "../../globals";
// <nowiki>

/**
 * Version of OO.ui.MessageDialog that translates and scrolls itself by
 * an initial offset amount when opened.
 * @param {Object} config 
 */
function ScrolledMessageDialog(config) {
	// Call the parent constructor
	ScrolledMessageDialog.super.call( this, config );
}
OO.inheritClass( ScrolledMessageDialog, OO.ui.MessageDialog );

ScrolledMessageDialog.prototype.getReadyProcess = function ( data ) {
	data = data || {};
	const $frameEl = this.$element.find(".oo-ui-window-frame");

	// Parent method
	return ScrolledMessageDialog.super.prototype.getReadyProcess.call( this, data )
		.next(() => {
			// Translate and scroll by the initial offset amount
			const scrollBy = data.scrollBy || 0;
			$frameEl.css("transform", `translate(0px, ${scrollBy}px)`);
			window.scrollTo(0, scrollBy);
		});
};

export default ScrolledMessageDialog;

// </nowiki>