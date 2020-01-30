/*  _____________________________________________________________________________
 * |                                                                             |
 * |                    === WARNING: GLOBAL GADGET FILE ===                      |
 * |                  Changes to this page affect many users.                    |
 * | Please discuss changes on the talk page or on [[WT:Gadget]] before editing. |
 * |_____________________________________________________________________________|
 * 
 * This gadget checks the page, and loads the hidden XFDcloser-core gadget if needed
 */
/* jshint esversion: 5, maxerr: 999 */
/* <nowiki> */
(function(){
	if ( /(?:\?|&)(?:action|diff|oldid)=/.test(window.location.href) ) {
		// Page is in edit, history, diff, or oldid mode
		return;
	}
	var xfdpage_regex = /(Articles_for_deletion\/|Miscellany_for_deletion|User:Cyberbot_I\/AfD's_requiring_attention|Wikipedia:WikiProject_Deletion_sorting\/(?!(Flat|Compact)$)|(Categories|Files|Templates|Redirects)_for_discussion(?!\/(Working|Holding_cell|Speedy)))(?!\/?(?:Administrator_instructions|Common_outcomes)$)/;
	if ( !xfdpage_regex.test(mw.config.get("wgPageName")) ) {
		// Current page is not an XfD page;
		return;
	}
	mw.loader.load("ext.gadget.XFDcloser-core");
})();
/* </nowiki> */