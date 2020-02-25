// <nowiki>

/**
 * 
 * @param {Object} config
 * @param {Boolean} config.multimode
 * @param {Boolean} config.relisting
 */
function RationaleWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	RationaleWidget.super.call( this, config );

	this.label = new OO.ui.LabelWidget( {
		label: $("<strong>").text(config.relisting ? "Relist comment" : "Rationale")
	} );
	this.$element.append(this.label.$element);

	if (config.multimode) {
		this.copyButton = new OO.ui.ButtonWidget( {
			label: "Copy from above",
			framed: false
		} );
		this.copyButton.$element.css({"float":"right"});
		this.$element.append(this.copyButton.$element);
	}
	
	this.textbox = new OO.ui.MultilineTextInputWidget( {
		rows: config.relisting ? 2 : 4
	} );
	this.$element.append(this.textbox.$element);

	if (!config.relisting) {
		this.newSentenceOption = new OO.ui.CheckboxMultioptionWidget( {
			label: "Result is a new sentence",
			selected: true
		} );
		this.$element.append(this.newSentenceOption.$element);
	}
}
OO.inheritClass( RationaleWidget, OO.ui.Widget );

export default RationaleWidget;
// </nowiki>