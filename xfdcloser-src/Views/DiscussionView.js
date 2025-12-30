import { $, mw, OO } from "../../globals";
import DiscussionViewController from "../Controllers/DiscussionViewController";
import { getRelevantResults } from "../data";
import Discussion from "../Models/Discussion";
import { dateFromSigTimestamp, dateFromParts } from "../util";
import * as prefs from "../prefs";
// <nowiki>

function xfdcActionLabel(label) {
	// TODO: Once beta testing is completed, the styles should be in styles.css rather than here 
	return new OO.ui.HtmlSnippet(`<span class="xfdc-action" style="margin:0;">[<a>${label}</a>]</span>`);
}

// Hack to ensure a sensible button menu width in all skins - default sizing
// does not work reliably in all skins (as of May 2020). The optimal value is
// calculated from the width of the longest label (Quick Delete) when placed
// within the overlay element (#mw-content-text).
const calculatedButtonMenuWidth = (function() {
	const padding = 2 * 12; // left+right menu option padding per styles.css
	const $testElement = $("<span>").text("Quick Delete");
	$("#mw-content-text").append($testElement);
	const width = $testElement.width();
	$testElement.remove();
	return Math.ceil(width) + padding + 5; // extra 5 safety margin
})();

/**
 * 
 * @param {Discussion} model
 */
function DiscussionView(model) {
	// Call the parent constructor
	DiscussionView.super.call( this, {
		$element:  $("<span>").attr({ "id": model.id, "class": "xfdc-status" }),
		classes: model.classes,
	} );
	this.model = model;

	this.$headlineSpan = model.$headlineSpan;

	this.closeButton = new OO.ui.ButtonWidget({
		framed: false,
		label: xfdcActionLabel("Close"),
		title: "Close discussion...",
		classes: "xfdc-action"
	});
	this.relistButton = new OO.ui.ButtonWidget({
		framed: false,
		label: xfdcActionLabel("Relist"),
		title: "Relist discussion...",
		classes: "xfdc-action"
	});
	const quickKeepMenuOption = new OO.ui.MenuOptionWidget( {
		data: "quickKeep",
		label: "Quick Keep",
		title: "close as \"keep\", remove nomination templates, add old xfd templates to talk pages",
		classes: ["xfdc-menuOptionWidget"]
	} );
	const canQuickDelete = !!getRelevantResults(this.model.venue.type, this.model.userIsSysop).find(resultData => resultData.name === "delete");
	if (canQuickDelete) {
		const quickDeleteDescription = !this.model.userIsSysop || (this.model.venue.type === "tfd" && prefs.get("tfdDeleteAction") === "holdingCell")
			? "list nominated pages for deletion"
			: "delete nominated pages & their talk pages";
		this.quickCloseMenuOptions = [
			quickKeepMenuOption,
			new OO.ui.MenuOptionWidget( {
				data: "quickDelete",
				label: "Quick Delete",
				title: `quickDelete: close as "delete", ${quickDeleteDescription}`,
				classes: ["xfdc-menuOptionWidget"]
			} )
		];
	} else {
		this.quickCloseMenuOptions = [ quickKeepMenuOption ];
	}
	
	this.quickCloseButtonMenu = new OO.ui.ButtonMenuSelectWidget( {
		framed: false,
		indicator: "down",
		label:  xfdcActionLabel("quickClose"),
		title: "Quickly close discussion...",
		$overlay: $("#mw-content-text"),
		menu: {
			items: this.quickCloseMenuOptions,
			width: calculatedButtonMenuWidth > 100 ? calculatedButtonMenuWidth : "10em" // fallback to a large value if something goes weird with calculation
		}
	} );

	this.buttonGroup = new OO.ui.ButtonGroupWidget({
		items: [ 
			this.closeButton,
			this.quickCloseButtonMenu,
			this.relistButton,
		]
	});
	this.buttonGroup.$element.css({margin: "-1em 0"}); // Avoids excess whitespace when added to DOM
	
	this.statusLabel = new OO.ui.LabelWidget({
		label: "XFDcloser loading..."
	});

	this.$element.append(
		this.buttonGroup.$element,
		this.statusLabel.$element
	);

	this.controller = new DiscussionViewController(this.model, this);
}
OO.inheritClass(DiscussionView, OO.ui.Widget);

DiscussionView.prototype.onQuickCloseChoose = function(menuOption) {
	this.emit("actionSelect", menuOption.getData());
};

/**
 * @param {Object} params
 * @param {Number} params.headingIndex
 * @param {HTMLElement} params.context
 * @param {Venue} params.venue
 * @param {String} params.currentPageName
 * @param {Boolean} params.userIsSysop
 */
DiscussionView.newFromHeadline = function({headingIndex, context, venue, currentPageName, userIsSysop}) {
	const id = "XFDC" + headingIndex,
		$headlineSpan = $(context),
		$heading = $headlineSpan.parent();

	// Get section header
	$(".mw-headline-number", context).prependTo($heading); // Fix for "Auto-number headings" preference
	const sectionHeader = $headlineSpan.text().trim();

	// Check if already closed. Closed AfDs and MfDs have the box above the heading; others have it below.
	if (/(afd|mfd)/.test(venue.type) && $heading.parent().attr("class") && $heading.parent().attr("class").includes("xfd-closed")) {
		// Skip 
		return;
	} else if (!/(afd|mfd)/.test(venue.type) && $heading.next().attr("class")) {
		// Only for closed discussion will the next element after the heading have any class set
		// Skip, add class to enable hiding of closed discussions
		$heading.addClass("xfd-closed");
		return;
	}

	// Get the section edit link, and section number
	let sectionlink = $heading.find(".mw-editsection a")
		.not(".mw-editsection-visualeditor, .autoCloserButton").attr("href");
	if (!sectionlink) {
		// Try to find a section link generated by Module:XfD_old.
		sectionlink = $heading.next().find(".xfdOldSectionEdit > a").attr("href");
		if (!sectionlink) {
			// XFDcloser can't work without knowing the nompage and section number, so skip this section.
			return;
		}
		// Add a "T-" so the next check will see this as a transcluded section
		sectionlink = sectionlink.replace("section=", "section=T-");
	}
	let editsection = sectionlink.split("section=")[1].split("&")[0];

	// Get the nomination page
	let nompage;
	if (/T/.test(editsection)) {
		// Section is transcluded from another page
		nompage = mw.Title.newFromText(decodeURIComponent(sectionlink.split("title=")[1].split("&")[0])).getPrefixedText();
		if ([
			"Wikipedia:Redirects for discussion/Header",
			"Wikipedia:Redirect/Deletion reasons",
			"Wikipedia:Templates for discussion/Holding cell",
			"Wikipedia:Categories for discussion/Speedy"
		].includes(nompage)) {
			// ignore headings transcuded from these pages
			return;
		}
		// remove "T-" from section number
		editsection = editsection.substr(2);
	} else {
		// Section is on current page, not transcluded
		if (venue.transcludedOnly) {
			return;
		}
		nompage = mw.Title.newFromText(currentPageName).getPrefixedText();
	}

	// Find all nodes that are part of this discussion (i.e. excluding subsequent closed discussions)
	$("table.mw-collapsible").has("div.xfd-closed").addClass("xfd-closed");	// Fix for closed discussion within a collapsed table (e.g. MfD)
	const headlineouter = venue.html.headlineouter;
	const $discussionNodes = $heading.nextUntil(headlineouter + ", div.xfd-closed, table.xfd-closed");
	$discussionNodes.addClass(`${id}-discussion-node`);

	// Get list of nominated pages. Also the proposed action for CfD.
	let pages = [];
	let action = "";
	if (venue.type === "cfd") {
		//CFDs: Nominated pages are the first link of an <li> item in a <ul> list, within a <dl> list
		pages = $discussionNodes
			.find("dd > ul > li")
			.has("b:first-child:contains(\"Propose \")")
			.find("a:first-of-type")
			.not(".external")
			.map(function () { return mw.Title.newFromText($(this).text()); })
			.get();
		if (pages.length === 0) {
			// Sometimes nominated pages are instead just in a <ul> list, e.g.
			// Wikipedia:Categories_for_discussion/Log/2019_February_5#Foo_in_fiction
			pages = $heading
				.next("ul")
				.find("li")
				.find("a:first-of-type")
				.not(".external")
				.map(function () { return mw.Title.newFromText($(this).text()); })
				.get();
		}
		// Try to find the proposed action
		const $action = $heading
			.next()
			.find("dd > ul > li > b")
			.first();
		if ($action.length) {
			action = $action.text().replace(/propose /i, "");
		}
	} else if (venue.type === "rfd" || venue.type === "mfd") {
		// MFD & RFD have nominated page links prior to span with classes plainlinks, lx
		pages = $discussionNodes
			.find(venue.html.listitem)
			.has("span.plainlinks.lx")
			.children("span")
			.filter(":first-child")
			.children("a, span.plainlinks:not(.lx)")
			.filter(":first-child")
			.map(function () { return mw.Title.newFromText($(this).text()); })
			.get();
	} else {
		// AFD, FFD, TFD: nominated page links inside span with classes plainlinks, nourlexpansion
		pages = $discussionNodes
			.find(venue.html.listitem + " > span.plainlinks.nourlexpansion")
			.filter(":nth-of-type(" + venue.html.nthSpan + ")")
			.children("a")
			.filter(":first-child")
			.map(function () { return mw.Title.newFromText($(this).text()); })
			.get();
	}

	// Sanity check that page names were actually found
	if (!pages || pages.length === 0 || pages.some(function (p) { return !p; })) {
		// Reset to empty array (offer a "basic" close using the section header)
		pages = [];
	}

	// Info/checks based on discussion content - age, relists, first timestamp, rfds to ignore
	let firstDate;
	let isOld;
	const classes = [];
	const $clonedDiscussionNodes = $discussionNodes.clone()
		.find("span.localcomments").each(function () { // replace local times with UTC times
			var utcTime = $(this).attr("title");
			$(this).text(utcTime);
		})
		.end();
	const discussionText = $clonedDiscussionNodes.text();

	if (venue.type === "rfd") {
		// Ignore relisted RfD discussions, and non-boxed closed RfD discussions
		if (discussionText.includes("Relisted, see Wikipedia:Redirects for discussion") ||
			discussionText.includes("Closed discussion, see full discussion")) {
			return;
		}
		// Find first timestamp date
		const firstDateMatch = /(?:\d\d:\d\d, )(\d{1,2} \w+ \d{4})(?: \(UTC\))/.exec(discussionText);
		const firstDateString = firstDateMatch && firstDateMatch[1];
		if (firstDateString) {
			firstDate = dateFromParts.apply(null, firstDateString.split(" ").reverse() );
		}
	}
	
	// Check if relisted
	const lastRelist = $("<div>").append($clonedDiscussionNodes).find(".xfd_relist").last().text();
	if (lastRelist) {
		classes.push("xfdc-relisted");
	}

	// Check age (since last relist, or since transclusion)
	const notTranscludedCorrectlyMatch = discussionText.match(/(?:Automated|Procedural) (?:comment|Note).*transcluded.*/i);
	const notTranscludedCorrectlyComment = notTranscludedCorrectlyMatch && notTranscludedCorrectlyMatch[0];
	const timestampPatt = /\d\d:\d\d, \d{1,2} \w+ \d{4} \(UTC\)/;
	const listingTimestampMatch = (
		lastRelist.match(timestampPatt) ||
		notTranscludedCorrectlyComment && notTranscludedCorrectlyComment.match(timestampPatt) ||
		discussionText.match(timestampPatt)
	);
	const listingTimestampDate = listingTimestampMatch && dateFromSigTimestamp(listingTimestampMatch[0]);
	if (!listingTimestampDate) {
		classes.push("xfdc-unknownAge");
	} else {
		const millisecondsSinceListing = new Date() - listingTimestampDate;
		const discussionRuntimeDays = 7;
		const discussionRuntimeMilliseconds = discussionRuntimeDays * 24 * 60 * 60 * 1000;
		isOld = millisecondsSinceListing > discussionRuntimeMilliseconds;
		classes.push(isOld ? "xfdc-old" : "xfdc-notOld");
	}

	// Create model and view
	const model = new Discussion({
		$headlineSpan,
		id: "XFDC" + headingIndex,
		venue,
		pages,
		action,
		discussionPageName: nompage,
		sectionHeader,
		sectionNumber: editsection,
		firstCommentDate: firstDate,
		isOld,
		isRelisted: !!lastRelist,
		userIsSysop: userIsSysop,
		classes
	});
	return new DiscussionView(model);
};

export default DiscussionView;
// </nowiki>
