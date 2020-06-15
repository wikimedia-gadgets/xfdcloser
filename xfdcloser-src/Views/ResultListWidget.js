import { /*$,*/ OO } from "../../globals";
import ResultListWidgetController from "../Controllers/ResultListWidgetController";
// <nowiki>

function ResultListWidget( model, config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	ResultListWidget.super.call( this, config );
	// Mixin constructor
	OO.ui.mixin.GroupElement.call( this, {
		$group: this.$element,// $("<div class=\"xfdc-result-list-widget\">").appendTo(this.$element),
		...config
	} );

	this.model = model;

	this.$overlay = config.$overlay;

	this.controller = new ResultListWidgetController(this.model, this);
}
OO.inheritClass( ResultListWidget, OO.ui.Widget );
OO.mixinClass( ResultListWidget, OO.ui.mixin.GroupElement );

export default ResultListWidget;
// </nowiki>