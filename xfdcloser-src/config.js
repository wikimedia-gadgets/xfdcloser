import { $, mw } from "../globals";
import Venue from "./Venue";

// <nowiki>
const scriptVersion = "4.0.0-alpha";

let mwConfig = mw.config.get( [
	"wgPageName",
	"wgUserGroups",
	"wgFormattedNamespaces",
	"wgArticleId"
] );
// Set custom version of namespaces with description for namespace 0
mwConfig.namespaces = $.extend({}, mwConfig.wgFormattedNamespaces, {0: "article"});
// Month names - no longer provided by mw.config, see phab:T219340
const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let config = {
	// Script info
	script: {
		advert: `([[WP:XFDC#${scriptVersion}|XFDcloser]])`,
		version: scriptVersion
	},
	// Mobile site detection, as that requires some special handling
	isMobileSite: window.location.host.includes(".m.") || window.location.search.includes("useformat=mobile"),
	// MediaWiki configuration values
	mw: mwConfig,
	// Static values
	wgMonthNames: months, // 1-indexed month names
	monthNames: months.slice(1), // 0-indexed month names
	// Set sysop status
	user: {
		isSysop: mwConfig.wgUserGroups.includes("sysop"),
		sig: mwConfig.wgUserGroups.includes("sysop")
			? "~~~~"
			: "<small>[[Wikipedia:NACD|(non-admin closure)]]</small> ~~~~"
	},
	// Start time, for detecting edit conflicts
	startTime: new Date(),
	// Variables for tracking across multiple discussions
	track: {
		// Track Afd logpage edits using deferred objects, to know when it is safe to read the wikitext
		"afdLogEdit": [$.Deferred().resolve()],
		// Track how many closes/relists have been started and completed
		"started":  0,
		"finished": 0,
		"discussions": []
	},
	// Venue object based on current page
	venue: Venue.newFromPageName(mwConfig.wgPageName)
};
// Deprecated property xfd:
config.xfd = config.venue;

// Adjust some settings if running in sandbox mode
if (window.XFDC_SANDBOX) config = window.XFDC_MAKE_SANDBOX_CONFIG(config);

export default config;
// </nowiki>