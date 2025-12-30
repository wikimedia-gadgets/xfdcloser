import { OO } from "../../globals";
// <nowiki>

function LookupMenuSelectWidget(config) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	LookupMenuSelectWidget.super.call( this, config );

}
OO.inheritClass( LookupMenuSelectWidget, OO.ui.MenuSelectWidget );

LookupMenuSelectWidget.prototype.getItemMatcher = function ( s, exact ) {
	var re;
	if ( s.normalize ) {
		s = s.normalize();
	}
	s = exact ? s.trim() : s.replace( /^\s+/, "" );
	re = s.replace( /([\\{}()|.?*+\-^$[\]])/g, "\\$1" ).replace( /\s+/g, "\\s+" );
	if ( exact ) {
		re = "^\\s*" + re + "\\s*$";
	}
	re = new RegExp( re, "i" );
	return function ( item ) {
		var matchText = item.getMatchText();
		if ( matchText.normalize ) {
			matchText = matchText.normalize();
		}
		return re.test( matchText );
	};
};

export default LookupMenuSelectWidget;
// </nowiki>
