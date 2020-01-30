/**
 * XFDcloser sandbox Loader:
 * On XFD pages, load the sandbox version of XFDcloser (after loading dependencies)
 */
/* jshint esversion: 5, maxerr: 999 */
/* <nowiki> */

$.when(
	// Resource loader modules
	mw.loader.using([
		"mediawiki.util", "mediawiki.api", "mediawiki.Title",
		"oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows",
		"ext.gadget.libExtraUtil", "ext.gadget.morebits"
	]),
	// Stylesheets
	importStylesheet( "MediaWiki:Gadget-XFDcloser.css" ),
	// Page ready
	$.ready
).then(function() {
	var config = mw.config.get( [
		"wgPageName",
		"wgUserGroups"
	] );
	
	/* Quick checks that script should be running */
	if ( /(?:\?|&)(?:action|diff|oldid)=/.test(window.location.href) ) {
		// Page is in edit, history, diff, or oldid mode
		return;
	}
	
	if (
		config.wgUserGroups.indexOf("extendedconfirmed") === -1 &&
		config.wgUserGroups.indexOf("sysop") === -1
	) {
		// User is not extendedconfirmed or sysop
		return;
	}
	
	var xfdpage_regex = /(Articles_for_deletion\/|Miscellany_for_deletion|User:Cyberbot_I\/AfD's_requiring_attention|Wikipedia:WikiProject_Deletion_sorting\/(?!(Flat|Compact)$)|(Categories|Files|Templates|Redirects)_for_discussion(?!\/(Working|Holding_cell|Speedy)))(?!\/?(?:Administrator_instructions|Common_outcomes)$)/;
	if ( !xfdpage_regex.test(config.wgPageName) ) {
		// Current page is not an XfD page;
		return;
	}
	
	/* Load the sandbox script */
	importScript("User:Evad37/XFDcloser/sandbox/core.js");

});
/* </nowiki> */