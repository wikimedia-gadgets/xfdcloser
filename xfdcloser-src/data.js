/**
 * Static data
 */
// <nowiki>
const resultsData = [
	// Keep
	{
		name: "keep",
		label: "Keep",
		title: "Close discussion as \"keep\"",
		allowSpeedy: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["updatePages", "noActions"]
	},

	// Delete (not CFD/TFD)
	{
		name: "delete",
		label: "Delete",
		title: "Close discussion as \"delete\"",
		allowSpeedy: true,
		allowSoft: true,
		sysopOnly: true,
		venues: ["afd", "ffd", "mfd", "rfd"],
		actions: ["deletePages", "noActions"]
	},
	// Delete (CFD)
	{
		name: "delete",
		label: "Delete",
		title: "Close discussion as \"delete\"",
		allowSpeedy: true,
		allowSoft: true,
		venues: ["cfd"],
		actions: ["noActions"]
	},
	// Delete (sysop, TFD)
	{
		name: "delete",
		label: "Delete",
		title: "Close discussion as \"delete\"",
		allowSpeedy: true,
		allowSoft: true,
		sysopOnly: true,
		venues: ["tfd"],
		actions: ["deletePages", "holdingCell", "noActions"]
	},
	// Delete (non-sysop, TFD)
	{
		name: "delete",
		label: "Delete",
		title: "Close discussion as \"delete\"",
		allowSpeedy: true,
		allowSoft: true,
		nonSysopOnly: true,
		venues: ["tfd"],
		actions: ["holdingCell", "noActions"]
	},

	// Redirect (sysop, AFD/MFD)
	{
		name: "redirect",
		label: "Redirect",
		title: "Close discussion as \"redirect\"",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		sysopOnly: true,
		venues: ["afd", "mfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Redirect (non-sysop, AFD/MFD)
	{
		name: "redirect",
		label: "Redirect",
		title: "Close discussion as \"redirect\"",
		requireTarget: true,
		allowSoft: true,
		nonSysopOnly: true,
		venues: ["afd", "mfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Redirect (CFD)
	{
		name: "redirect",
		label: "Redirect",
		title: "Close discussion as \"redirect\"",
		requireTarget: true,
		venues: ["cfd"],
		actions: ["noActions"]
	},
	// Redirect (sysop, TFD)
	{
		name: "redirect",
		label: "Redirect",
		title: "Close discussion as \"redirect\"",
		requireTarget: true,
		allowDeleteFirst: true,
		sysopOnly: true,
		venues: ["tfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Redirect (non-sysop, TFD)
	{
		name: "redirect",
		label: "Redirect",
		title: "Close discussion as \"redirect\"",
		requireTarget: true,
		nonSysopOnly: true,
		venues: ["tfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},

	// Rename (CFD)
	{
		name: "rename",
		label: "Rename",
		title: "Close discussion as \"rename\"",
		requireTarget: true,
		venues: ["cfd"],
		actions: ["noActions"]
	},

	// Retarget (sysop, RFD)
	{
		name: "retarget",
		label: "Retarget",
		title: "Close discussion as \"retarget\"",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		sysopOnly: true,
		venues: ["rfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Retarget (non-sysop, RFD)
	{
		name: "retarget",
		label: "Retarget",
		title: "Close discussion as \"retarget\"",
		requireTarget: true,
		allowSoft: true,
		nonSysopOnly: true,
		venues: ["rfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},

	// Soft redirect (RFD)
	{
		name: "soft redirect",
		label: "Soft redirect",
		title: "Close discussion as \"soft redirect\"",
		requireTarget: true,
		venues: ["rfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},

	// Disambiguate (RFD)
	{
		name: "disambiguate",
		label: "Disambiguate",
		title: "Close discussion as \"disambiguate\"",
		venues: ["rfd"],
		actions: ["disambiguateAndUpdate", "noActions"]
	},

	// Merge (AFD/MFD)
	{
		name: "merge",
		label: "Merge",
		title: "Close discussion as \"merge\"",
		requireTarget: true,
		venues: ["afd", "mfd"],
		actions: ["mergeAndUpdate", "noActions"]
	},
	// Merge (CFD)
	{
		name: "merge",
		label: "Merge",
		title: "Close discussion as \"merge\"",
		requireTarget: true,
		venues: ["cfd"],
		actions: ["noActions"]
	},
	// Merge (TFD)
	{
		name: "merge",
		label: "Merge",
		title: "Close discussion as \"merge\"",
		requireTarget: true,
		venues: ["tfd"],
		actions: ["holdingCellMerge", "noActions"]
	},

	// No consensus
	{
		name: "no consensus",
		label: "No consensus",
		title: "Close discussion as \"no consensus\"",
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["updatePages", "noActions"]
	},

	// Custom (sysop, not CFD)
	{
		name: "custom",
		label: "Custom",
		title: "Close discussion with a custom result",
		sysopOnly: true,
		venues: ["afd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["updatePages", "deletePages", "noActions"]
	},
	// Custom (sysop, CFD)
	{
		name: "custom",
		label: "Custom",
		title: "Close discussion with a custom result",
		sysopOnly: true,
		venues: ["cfd"],
		actions: ["noActions", "updatePages"]
	},
	// Custom (non-sysop)
	{
		name: "custom",
		label: "Custom",
		title: "Close discussion with a custom result",
		nonSysopOnly: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["noActions", "updatePages"]
	}
];

const rcats = [
	{
		group: "Common",
		names: [
			"R to related topic",
			"R from subtopic",
			"R to list entry",
			"R to section"
		]
	},
	{
		group: "Related information",
		names: [
			"R from album",
			"R to article without mention",
			"R from book",
			"R to decade",
			"R from domain name",
			"R from top-level domain",
			"R from film",
			"R from gender",
			"R from list topic",
			"R from member",
			"R to related topic",
			"R from related word",
			"R from phrase",
			"R from school",
			"R from song",
			"R from subtopic",
			"R to subtopic",
			"R from Unicode"
		]
	},
	{
		group: "Fiction",
		names: [
			"R from fictional character",
			"R from fictional element",
			"R from fictional location",
			"R to TV episode list entry"
		]
	},
	{
		group: "Abbreviation",
		names: [
			"R to acronym",
			"R from acronym",
			"R to initialism",
			"R from initialism"
		]
	},
	{
		group: "Capitalisation",
		names: [
			"R from CamelCase",
			"R from other capitalisation",
			"R from miscapitalisation"
		]
	},
	{
		group: "Grammar & punctuation",
		names: [
			"R from modification",
			"R from plural",
			"R to plural"
		]
	}, 
	{
		group: "Parts of speech",
		names: [
			"R from adjective",
			"R from adverb",
			"R from common noun",
			"R from gerund",
			"R from proper noun",
			"R from verb",
		]
	},
	{
		group: "Spelling",
		names: [
			"R from alternative spelling",
			"R from ASCII-only",
			"R to ASCII-only",
			"R from diacritic",
			"R to diacritic",
			"R from misspelling",
			"R from stylization"
		]
	},
	{
		group: "Alternative names (general)",
		names: [
			"R from alternative language",
			"R from alternative name",
			"R from former name",
			"R from historic name",
			"R from incorrect name",
			"R from long name",
			"R from portmanteau",
			"R from short name",
			"R from sort name",
			"R from less specific name",
			"R from more specific name",
			"R from synonym",
			"R from antonym",
		]
	},
	{
		group: "Alternative names (people)",
		names: [
			"R from birth name",
			"R from given name",
			"R to joint biography",
			"R from married name",
			"R from name with title",
			"R from personal name",
			"R from pseudonym",
			"R from surname",
		]
	},
	{
		group: "Alternative names (technical)",
		names: [
			"R from Java package name",
			"R from molecular formula",
			"R from technical name",
			"R to technical name",
			"R from trade name",
		]
	},
	{
		group: "Alternative names (organisms)",
		names: [
			"R from scientific name",
			"R from alternative scientific name",
			"R to scientific name",
		]
	},
	{
		group: "Alternative names (geography)",
		names: [
			"R from name and country",
			"R from more specific geographic name",
			"R from postal code"
		]
	},
	{
		group: "Navigation",
		names: [
			"R to anchor",
			"R avoided double redirect",
			"R from file metadata link",
			"R to list entry",
			"R mentioned in hatnote",
			"R to section",
			"R from shortcut",
			"R from template shortcut",
		]
	},
	{
		group: "Disambiguation",
		names: [
			"R from ambiguous term",
			"R to anthroponymy page",
			"R to disambiguation page",
			"R from incomplete disambiguation",
			"R from incorrect disambiguation",
			"R from other disambiguation",
			"R from unnecessary disambiguation",
		]
	},
	{
		group: "Merge, duplicate & move",
		names: [
			"R from duplicated article",
			"R with history",
			"R from merge",
			"R from move",
			"R with old history",
		]
	},
	{
		group: "To namespaces",
		names: [
			"R to category namespace",
			"R to draft namespace",
			"R to help namespace",
			"R to main namespace",
			"R to portal namespace",
			"R to project namespace",
			"R to talk page",
			"R to template namespace",
			"R to user namespace",
		]
	},
	{
		group: "ISO codes",
		names: [
			"R from ISO 4",
			"R from ISO 639 code",
			"R from ISO 3166 code",
			"R from ISO 4217 code",
			"R from ISO 15924 code",
		]
	},
	{
		group: "Miscellaneous",
		names: [
			"R printworthy",
			"R unprintworthy",
			"Wikidata redirect"
		]
	}
];

const actions = [
	{
		label: "Remove nomination templates, tag talk pages",
		name: "updatePages"
	},
	{
		label: "Delete pages",
		name: "deletePages",
		options: ["deleteTalk", "deleteRedir", "unlink"]
	},
	{
		label: "List pages at holding cell",
		name: "holdingCell",
		options: ["holdcellSection", "tagTalk"]
	},
	{
		label: "List pages at holding cell",
		name: "holdingCellMerge",
		options: ["holdcellMergeSection"]
	},
	{
		label: "Redirect pages, tag talk pages",
		name: "redirectAndUpdate",
		options: ["rcats"]
	},
	{
		label: "Remove nomination templates, tag talk pages",
		name: "disambiguateAndUpdate"
	},
	{
		label: "Add merge templates, tag talk pages",
		name: "mergeAndUpdate"
	},
	{
		label: "No automated actions",
		name: "noActions",
	}
];

const options = [
	{
		name: "deleteTalk",
		label: "Delete talk pages",
		type: "toggleSwitch",
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		sysopOnly: true,
		value: true // initial value
	},
	{
		name: "deleteRedir",
		label: "Delete redirects",
		type: "toggleSwitch",
		venues: ["afd", "cfd", "ffd", "mfd", "tfd"],
		value: true // initial value
	},
	{
		name: "unlink",
		label: "Unlink backlinks",
		type: "toggleSwitch",
		for: "deletePages",
		venues: ["afd", "ffd"],
		value: true // initial value
	},
	{
		name: "holdcellSection",
		label: "Holding cell section",
		type: "dropdown",
		venues: ["tfd"],
		items: [
			{label: "Review", data:"review"},
			{label: "Convert", data:"convert"},
			{label: "Substitute", data:"substitute"},
			{label: "Orphan", data:"orphan"},
			{label: "Ready for deletion", data:"ready"}
		]
	},
	{
		name: "tagTalk",
		label: "Tag talk pages for deletion",
		type: "toggleSwitch",
		for: "deletePages",
		venues: ["tfd"],
		nonSysopOnly: true,
		value: false // initial value
	},
	{
		name: "holdcellMergeSection",
		label: "Holding cell section",
		type: "dropdown",
		venues: ["tfd"],
		items: [
			{label: "Merge (Infoboxes)", data:"merge-infobox"},
			{label: "Merge (Navigation templates)", data:"merge-navigation"},
			{label: "Merge (Link templates)", data:"merge-link"},
			{label: "Merge (Sports)", data:"merge-sports"},
			{label: "Merge (Other)", data:"merge-other"},
			{label: "Merge (Meta)", data:"merge-meta"}
		]
	},
	{
		name: "rcats",
		label: "Rcats",
		type: "lookupMenuTagMultiselect",
		venues: ["cfd", "mfd", "rfd", "tfd"],
		items: rcats,
		value: []
	},
	{
		name: "rcats",
		label: "Rcats",
		type: "lookupMenuTagMultiselect",
		venues: ["afd"],
		items: rcats,
		value: ["{{R to related topic}}"]
	}
];

const prefs = [{
	name: "beta",
	label: "Enable beta version",
	type: "toggle",
	help: "Requires page refresh to take effect.",
	helpInline: true,
	default: false
}, {
	name: "watchlist",
	label: "Add edited pages to your watchlist",
	type: "dropdown",
	options: [{
		data: "preferences",
		label: "Default"
	}, {
		data: "watch",
		label: "Always"
	}, {
		data: "nochange",
		label: "Never"
	}],
	help: "Default behaviour follows your \"Watched pages\" settings in Special:Preferences § Watchlist",
	default: "preferences"
}, {
	name: "tfdDeleteAction",
	label: "Default action for TfD delete results",
	sysopOnly: true,
	type: "dropdown",
	options: [{
		data: "deletePages",
		label: "Delete pages"
	}, {
		data: "holdingCell",
		label: "List pages at holding cell"
	}],
	default: "holdingCell"
}, {
	name: "unlinkBacklinks",
	label: "Enable unlink backlinks option by default",
	sysopOnly: true,
	type: "toggle",
	default: true
}, {
	name: "collapseWarnings",
	label: "Collapse task warnings if at least:",
	type: "number",
	min: 2,
	default: 5
}, {
	name: "collapseErrors",
	label: "Collapse task errors if at least:",
	type: "number",
	min: 2,
	default: 5
}];

const defaultPrefValues = prefs.reduce((accumulated, currentPref) => {
	accumulated[currentPref.name] = currentPref.default;
	return accumulated;
}, {});

/**
 * @param {String} venueType type of venue, e.g. "afd"
 * @param {Boolean} userIsSysop
 * @returns {function(Object): boolean} 
 */
const isRelevant = (venueType, userIsSysop) => data => (
	(!Array.isArray(data.venues) || data.venues.includes(venueType)) &&
	(data.sysopOnly ? userIsSysop : true) &&
	(data.nonSysopOnly ? !userIsSysop : true)
);

/**
 * Get the resultsData filtered by venue and sysop stasus
 * 
 * @param {String} venueType type of venue, e.g. "afd"
 * @param {Boolean} userIsSysop 
 * @returns {Object[]} relevant resultsData
 */
const getRelevantResults = function(venueType, userIsSysop) {
	return resultsData.filter(isRelevant(venueType, userIsSysop));
};

/**
 * @param {String} venueType type of venue, e.g. "afd"
 * @param {Boolean} userIsSysop
 * @param {String} result
 * @returns {Object[]} relevant actions with only relevant options
 */
const getRelevantActions = function(venueType, userIsSysop, result) {
	const resultData = getRelevantResults(venueType, userIsSysop).find(resData => resData.name === result);
	if ( !resultData ) {
		console.log("No results data for", {venueType, userIsSysop, result});
		
	}
	return actions.filter(action => resultData.actions.includes(action.name));
};

/**
 * @param {String} venueType type of venue, e.g. "afd"
 * @param {Boolean} userIsSysop
 * @param {String} result
 * @returns {Object[]} relevant actions with only relevant options
 */
const getRelevantOptions = function(venueType, userIsSysop, actions) {
	const actionOptions = actions.flatMap(action => action.options || []);
	return options.filter(option => (
		actionOptions.includes(option.name) && isRelevant(venueType, userIsSysop)(option)
	)).map(option => ({...option})); // Make copies of objects, so the originals here are not touched
};

/**
 * 
 * @param {Boolean} userIsSysop
 * @returns {Object[]} relevant prefs
 */
const getRelevantPrefs = function(userIsSysop) {
	return prefs.filter(isRelevant(null, userIsSysop));
};

const softDeletionRationaleTemplate = "Wikipedia:XFDcloser/Soft deletion rationale";
/**
 * 
 * @param {string} pageName 
 * @param {string} nomLink 
 * @param {boolean} [isMulti]
 * @returns {string} Wikitext of soft deletion rationale template
 */
const makeSoftDeleteRationale = function(pageName, nomLink, isMulti) {
	const multiParam = isMulti ? "|multi=yes" : "";
	return `{{subst:${softDeletionRationaleTemplate}|1=${pageName}|2=${nomLink}${multiParam}}}`;
};

export { getRelevantResults, getRelevantActions, getRelevantOptions, getRelevantPrefs, makeSoftDeleteRationale };

export { resultsData, actions, options, prefs, defaultPrefValues, softDeletionRationaleTemplate };
// </nowiki>
