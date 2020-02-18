// <nowiki>

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

	this.showButton.connect( this, { "click": "onShowClick" } );
	this.hideButton.connect( this, { "click": "onHideClick" } );
}
OO.inheritClass( NoteWidget, OO.ui.Widget );

NoteWidget.prototype.onShowClick = function() {
	this.showButton.toggle(false);
	this.hideButton.toggle(true);
	this.noteContent.toggle(true);
};
NoteWidget.prototype.onHideClick = function() {
	this.showButton.toggle(true);
	this.hideButton.toggle(false);
	this.noteContent.toggle(false);
};

export default NoteWidget;

// </nowiki>