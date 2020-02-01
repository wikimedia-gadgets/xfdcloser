// <nowiki>
/* ========== ShowHideTag class =================================================================
   The 'tag' at the bottom of screen that toggles the visibility of closed discussions.
   ---------------------------------------------------------------------------------------------- */
// Constructor
var ShowHideTag = function() {
	// Determine previous state from localStorage
	try {
		if ( window.localStorage.getItem("xfdc-closedHidden") ) {
			this.isHidden = true;
		} else {
			this.isHidden = false;
		}
	} catch(e) {
		// If localStorage not available, default to not hidden
		this.isHidden = false;
	}
};
// ---------- ShowHideTag prototype ------------------------------------------------------------- */
ShowHideTag.prototype.hideClosed = function() {
	this.isHidden = true;
	try {
		window.localStorage.setItem("xfdc-closedHidden", true);
	}  catch(e) { /* continue regardless of error */ }
	$(".xfd-closed, .tfd-closed, #XFDcloser-showhide-hide").hide();
	$("#XFDcloser-showhide-show").show();
};

ShowHideTag.prototype.showClosed = function() {
	this.isHidden = false;
	try {
		window.localStorage.setItem("xfdc-closedHidden", "");
	}  catch(e) { /* continue regardless of error */ } 
	$(".xfd-closed, .tfd-closed, #XFDcloser-showhide-hide").show();
	$("#XFDcloser-showhide-show").hide();
};
	
ShowHideTag.initialiseNewTag = function() {
	const tag = new ShowHideTag();
	$("<div>")
		.attr("id", "XFDcloser-showhide")
		.append(
			$("<a>")
				.attr("id", "XFDcloser-showhide-hide")
				.text("Hide closed discussions")
				.toggle(!tag.isHidden)
				.on("click", tag.hideClosed),
			$("<a>")
				.attr("id", "XFDcloser-showhide-show")
				.text("Show closed discussions")
				.toggle(tag.isHidden)
				.on("click", tag.showClosed)
		)
		.appendTo("body");
	return tag;
};

export default ShowHideTag;
// </nowiki>