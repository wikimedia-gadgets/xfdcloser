import { $, OO } from "../../globals";
// <nowiki>

/**
 * 
 * @param {Object} config
 * @param {String} config.title Text for note title
 * @param {String|jQuery} config.noteContent Content for collapsible section of note 
 */
function NoteWidget(config) {
	// Call the parent constructor
	NoteWidget.super.call( this, config );

	this.title = new OO.ui.LabelWidget( {
		label: $("<strong>").text(config.title)
	} );

	this.noteContent = new OO.ui.LabelWidget( {
		label: $("<div>").append(config.noteContent),
		$element: $("<label style='display:block'>")
	} );
	this.noteContent.toggle(false);

	this.showButton = new OO.ui.ButtonWidget( {
		label: "[show]",
		framed: false
	} );
	this.showButton.$element.find("a").css("font-weight","normal");

	this.hideButton = new OO.ui.ButtonWidget( {
		label: "[hide]",
		framed: false
	} );
	this.hideButton.$element.find("a").css("font-weight","normal");
	this.hideButton.toggle(false);

	this.showHideButtonGroup = new OO.ui.ButtonGroupWidget( {
		items: [ this.showButton, this.hideButton ],
		$element: $("<div style='margin-left:2em;'>")
	} );

	this.$element
		.css({border:"1px dashed #888"})
		.append(
			this.title.$element,
			this.showHideButtonGroup.$element,
			this.noteContent.$element
		);

	this.showButton.connect( this, { "click": ["emit", "expand"] } );
	this.hideButton.connect( this, { "click": ["emit", "unexpand"] } );
}
OO.inheritClass( NoteWidget, OO.ui.Widget );

/**
 * @param {Boolean} expand 
 */
NoteWidget.prototype.setExpanded = function(expand) {
	this.showButton.toggle(!expand);
	this.hideButton.toggle(!!expand);
	this.noteContent.toggle(!!expand);
};

export default NoteWidget;

// </nowiki>