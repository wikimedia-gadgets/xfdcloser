import API from "../api";
// <nowiki>

function PreviewWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	PreviewWidget.super.call( this, config );

	this.latestRequestId = 0;

	this.$element.css({
		"border":"2px dashed #ccc",
		"border-radius":"5px",
		"padding":"5px"
	});
}
OO.inheritClass( PreviewWidget, OO.ui.Widget );

PreviewWidget.prototype.setWikitext = function(wikitext) {
	const requestId = ++this.latestRequestId;
	API.get({
		action: "parse",
		format: "json",
		text: wikitext,
		prop: "text",
		pst: 1,
		disablelimitreport: 1,
		contentmodel: "wikitext",
		formatversion: "2"
	})
		.then(response => {
			if ( requestId !== this.latestRequestId || !response || !response.parse || !response.parse.text) {
				return;
			}
			this.$element.html(response.parse.text);
			this.emit("resize");
		});
};

export default PreviewWidget;
// </nowiki>