import { $, mw } from "../globals";
import config from "./config";
import ShowHideTag from "./ShowHideTag";
import windowSetManager from "./windowSetManager";
import DiscussionView from "./Views/DiscussionView";
// <nowiki>

(function App() {
	// Quick checks that script should be running
	if (
		!config.mw.wgUserGroups.includes("extendedconfirmed") &&
		!config.mw.wgUserGroups.includes("sysop") &&
		config.mw.wgDBname !== "testwiki"
	) {
		// User is not extendedconfirmed, nor sysop, nor on testwiki
		return;
	}

	// Warn if unloading before closes/relists are completed
	$(window).on("beforeunload", function(e) {
		if ( windowSetManager.hasOpenWindows() ) {
			e.returnValue = "";
			return "";		
		}
	});

	// Preferences portlet link
	mw.util.addPortletLink("p-cactions", "#", "XFDC prefs", "p-xfdc-prefs", "XFDcloser preferences");
	$("#p-xfdc-prefs").click(e => {
		e.preventDefault();
		windowSetManager.openWindow("prefs", {
			userIsSysop: config.user.isSysop
		});
	});

	// Unlink portlet link: non-existant pages only
	if ( config.mw.wgArticleId === 0 ) {
		mw.util.addPortletLink("p-cactions", "#", "XFDC Unlink", "p-xfdc-unlink", "Unlink backlinks using XFDcloser");
		$("#p-xfdc-unlink").click(e => {
			e.preventDefault();
			// Try to find the deletion log comment
			let comment = "";
			let $commentEl = $(".mw-logline-delete").first().find(".comment").first();
			if ( $commentEl.length ) {
				let commentEl = $commentEl.get()[0];
				let children = commentEl.childNodes;
				for (let child of children) {
					if (child.nodeName == "A") {
						const target = child.href.replace(/^.*?\/wiki\//, "").replace(/_/g," ");
						const label = child.textContent;
						const wikilink = ( target === label ) ?
							`[[${label}]]` :
							`[[${target}|${label}]]`;
						comment += wikilink;
					} else {
						comment += child.nodeValue;
					}
				}
				comment = comment
					.replace(/ \(\[\[Wikipedia:XFDC(#[\d.]+)?|XFDcloser]]\)/, "")
					.slice(1,-1);
			}
			windowSetManager.openWindow("unlink", {
				summary: comment,
				pageName: config.mw.wgPageName
			});
		});
	} else {
		// Initialise show/hide closed discussions tag, unless there is only one discussion on the page
		const showHide = $("#mw-content-text " + config.xfd.html.head).length > 1 && ShowHideTag.initialiseNewTag();
		
		// Set up discussion object for each discussion
		$(config.xfd.html.head + " > span.mw-headline")
			.not(".XFDcloser-ignore")
			.each(function(index) {
				try {
					var discussionView = DiscussionView.newFromHeadline({
						headingIndex: index,
						context: this,
						venue: config.venue,
						currentPageName: config.mw.wgPageName,
						userIsSysop: config.user.isSysop
					});
					if ( discussionView && config.isMobileSite ) {
						$(this).parent().next().prepend(discussionView.$element);
					} else if ( discussionView ) {
						$(this).after(discussionView.$element);
					}
					//discussionView.fixButtonMenuWidth();
				} catch(e) {
					console.warn("[XFDcloser] Could not retrieve page info for " + $(this).text(), e);
				}
			});

		// If showHide state is hidden, hide any headings that may have had class 'xfd-closed' added
		if ( showHide && showHide.isHidden ) {
			showHide.hideClosed();
		}
	}
})();
// </nowiki>