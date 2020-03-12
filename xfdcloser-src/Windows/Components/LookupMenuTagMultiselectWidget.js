import LookupMenuSelectWidget from "./LookupMenuSelectWidget";
// <nowiki>

function LookupMenuTagMultiselectWidget(config) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	LookupMenuTagMultiselectWidget.super.call( this, config );

	// Use a LookupMenuSelectWidget for the menu
	this.menu = new LookupMenuSelectWidget( $.extend(
		{
			widget: this,
			input: this.hasInput ? this.input : null,
			$input: this.hasInput ? this.input.$input : null,
			filterFromInput: !!this.hasInput,
			$autoCloseIgnore: this.hasInput ?
				this.input.$element : $( [] ),
			$floatableContainer: this.hasInput && this.inputPosition === "outline" ?
				this.input.$element : this.$element,
			$overlay: this.$overlay,
			disabled: this.isDisabled(),
			multiselect: true
		},
		config.menu
	) );
	this.menu.connect( this, {
		choose: "onMenuChoose",
		toggle: "onMenuToggle"
	} );
	if ( this.hasInput ) {
		this.input.connect( this, { change: "onInputChange" } );
	}
	if ( this.$input ) {
		this.$input.prop( "disabled", this.isDisabled() );
		this.$input.attr( {
			role: "combobox",
			"aria-owns": this.menu.getElementId(),
			"aria-autocomplete": "list"
		} );
	}
	if ( !this.popup ) {
		this.$content.append( this.$input );
		this.$overlay.append( this.menu.$element );
	}
}
OO.inheritClass( LookupMenuTagMultiselectWidget, OO.ui.MenuTagMultiselectWidget );

// LookupMenuTagMultiselectWidget.prototype.getValue = function() {
// 	return this.menu.findSelectedItems().map(item => item.getData());
// };

export default LookupMenuTagMultiselectWidget;
// </nowiki>