/**
 * Static data
 */
// <nowiki>
const resultsData = [
	// Keep
	{
		result: "keep",
		allowSpeedy: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["updatePages", "noActions"]
	},

	// Delete (not CFD/TFD)
	{
		result: "delete",
		allowSpeedy: true,
		allowSoft: true,
		sysopOnly: true,
		venues: ["afd", "ffd", "mfd", "rfd"],
		actions: ["deletePages", "noActions"]
	},
	// Delete (CFD)
	{
		result: "delete",
		allowSpeedy: true,
		allowSoft: true,
		sysopOnly: true,
		venues: ["cfd"],
		actions: ["noActions"]
	},
	// Delete (sysop, TFD)
	{
		result: "delete",
		allowSpeedy: true,
		allowSoft: true,
		sysopOnly: true,
		venues: ["tfd"],
		actions: ["deletePages", "holdingCell", "noActions"]
	},
	// Delete (non-sysop, TFD)
	{
		result: "delete",
		nonSysopOnly: true,
		venues: ["tfd"],
		actions: ["holdingCell", "noActions"]
	},

	// Redirect (sysop, AFD/MFD)
	{
		result: "redirect",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		sysopOnly: true,
		venues: ["afd", "mfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Redirect (non-sysop, AFD/MFD)
	{
		result: "redirect",
		requireTarget: true,
		allowSoft: true,
		nonSysopOnly: true,
		venues: ["afd", "mfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Redirect (CFD)
	{
		result: "redirect",
		requireTarget: true,
		venues: ["cfd"],
		actions: ["noActions"]
	},
	// Redirect (non-sysop, TFD)
	{
		result: "redirect",
		requireTarget: true,
		allowDeleteFirst: true,
		sysopOnly: true,
		venues: ["tfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Redirect (non-sysop, TFD)
	{
		result: "redirect",
		requireTarget: true,
		nonSysopOnly: true,
		venues: ["tfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},

	// Rename (CFD)
	{
		result: "rename",
		requireTarget: true,
		venues: ["cfd"],
		actions: ["noActions"]
	},

	// Retarget (sysop, RFD)
	{
		result: "retarget",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		sysopOnly: true,
		venues: ["rfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Retarget (non-sysop, RFD)
	{
		result: "retarget",
		requireTarget: true,
		allowSoft: true,
		nonSysopOnly: true,
		venues: ["rfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},

	// Soft redirect (RFD)
	{
		result: "soft redirect",
		requireTarget: true,
		venues: ["rfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},

	// Disambiguate (RFD)
	{
		result: "disambiguate",
		venues: ["rfd"],
		actions: ["disambiguateAndUpdate", "noActions"]
	},

	// Merge (AFD/CFD/MFD)
	{
		result: "merge",
		requireTarget: true,
		venues: ["afd", "mfd"],
		actions: ["updatePages", "noActions"]
	},
	// Merge (CFD)
	{
		result: "merge",
		requireTarget: true,
		venues: ["cfd"],
		actions: ["noActions"]
	},
	// Merge (TFD)
	{
		result: "merge",
		requireTarget: true,
		venues: ["tfd"],
		actions: ["holdingCellMerge", "noActions"]
	},

	// No consensus
	{
		result: "no consensus",
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["updatePages", "noActions"]
	},

	// Custom (sysop)
	{
		result: "custom",
		sysopOnly: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["updatePages", "deletePages", "noActions"]
	},
	// Custom (non-sysop)
	{
		result: "custom",
		nonSysopOnly: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["updatePages", "noActions"]
	}
];

const actions = [
	{
		label: "Remove nomination templates, tag talk pages",
		data: {
			name: "updatePages"
		},
	},
	{
		label: "Delete pages",
		data: {
			name: "deletePages",
			options: [
				{
					name: "deleteTalk",
					label: "Delete talk pages",
					type: "toggleSwitch",
					venue: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
					sysopOnly: true
				},
				{
					name: "deleteRedir",
					label: "Delete redirects",
					type: "toggleSwitch",
					venue: ["afd", "cfd", "ffd", "mfd", "tfd"],
				},
				{
					name: "unlink",
					label: "Unlink backlinks",
					type: "toggleSwitch",
					for: "deletePages",
					venue: ["afd", "ffd"],
				}
			]
		}
	},
	{
		label: "List pages at holding cell",
		data: {
			name: "holdingCell",
			options: [
				{
					name: "holdcellSection",
					label: "Holding cell section",
					type: "dropdown",
					venue: ["tfd"],
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
					venue: ["tfd"],
					nonSysopOnly: true
				}
			]
		}
	},
	{
		label: "List pages at holding cell",
		data: {
			name: "holdingCellMerge",
			options: [
				{
					name: "holdcellSection",
					label: "Holding cell section",
					type: "dropdown",
					venue: ["tfd"],
					items: [
						{label: "Merge (Arts)", data:"merge-arts"},
						{label: "Merge (Geography, politics and governance)", data:"merge-geopolgov"},
						{label: "Merge (Religion)", data:"merge-religion"},
						{label: "Merge (Sports)", data:"merge-sports"},
						{label: "Merge (Transport)", data:"merge-transport"},
						{label: "Merge (Other)", data:"merge-other"},
						{label: "Merge (Meta)", data:"merge-meta"}
					]
				}
			]
		},
	},
	{
		label: "Redirect pages, tag talk pages",
		data: {
			name: "redirectAndUpdate",
			options: [
				{
					name: "rcats",
					label: "Rcats",
					type: "rcatMulitSelect",
					venue: ["afd", "cfd", "mfd", "rfd", "tfd"],
					items: [
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
								"R from less specific name}",
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
					]
				}
			]
		},
	},
	{
		label: "Remove nomination templates, tag talk pages",
		data: {name: "disambiguateAndUpdate"}
	},
	{
		label: "Add merge templates, tag talk pages",
		data: {name: "mergeAndUpdate"}
	},
	{
		label: "No automated actions",
		data: {name: "noActions"},
	}
];

export {resultsData, actions};
// </nowiki>