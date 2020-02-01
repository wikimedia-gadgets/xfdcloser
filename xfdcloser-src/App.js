import config from "./config";
import ShowHideTag from "./ShowHideTag";
import Discussion from "./Discussion";

// <nowiki>

(function App() {
	// Quick checks that script should be running
	if (
		!config.mw.wgUserGroups.includes("extendedconfirmed") &&
		!config.mw.wgUserGroups.includes("sysop")
	) {
		// User is not extendedconfirmed or sysop
		return;
	}

	// Warn if unloading before closes/relists are completed
	$(window).on("beforeunload", function(e) {
		if ( config.track.started > config.track.finished ) {
			e.returnValue = "";
			return "";		
		}
	});

	// Initialise show/hide closed discussions tag, unless there is only one discussion on the page
	const showHide = $("#mw-content-text " + config.xfd.html.head).length > 1 && ShowHideTag.initialiseNewTag();

	// Set up discussion object for each discussion
	$(config.xfd.html.head + " > span.mw-headline")
		.not(".XFDcloser-ignore")
		.each(function(i) {
			var d = Discussion.newFromHeadlineSpan(i, this);
			if ( d ) {
				try {
					if ( d.isBasicMode() ) {
						d.showLinks();
					} else if (d.pages.length > 50 && !config.user.isSysop) {
						d.setStatus(
							extraJs.addTooltip(
								$("<span>")
									.addClass("xfdc-status")
									.css({"color":"#9900A2"})
									.text("[Too many pages]"),
								"Only administrators can close or relist discussions with more than "+
							"50 nominated pages using XFDcloser."
							)
						);
					} else {
						d.retrieveExtraInfo()
							.then(
								function() { d.showLinks(); },
								function(failMessage) {
									// set "basic" mode, show "basic" links with the failure message 
									d.pages = false;
									d.showLinks(failMessage);
								}
							);
					}
				} catch(e) {
					console.warn("[XFDcloser] Could not retrieve page info for " + $(this).text() +
				" [see error below]");
					console.warn(e);
				}
			}
		});

	// If showHide state is hidden, hide any headings that may have had class 'xfd-closed' added
	if ( showHide && showHide.isHidden ) {
		showHide.hideClosed();
	}

})();
// </nowiki>