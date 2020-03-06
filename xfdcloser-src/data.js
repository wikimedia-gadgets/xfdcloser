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

	// Redirect (sysop, not CFD/RFD)
	{
		result: "redirect",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		sysopOnly: true,
		venues: ["afd", "mfd", "tfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Redirect (non-sysop, not CFD/RFD)
	{
		result: "redirect",
		requireTarget: true,
		allowSoft: true,
		nonSysopOnly: true,
		venues: ["afd", "mfd", "tfd"],
		actions: ["redirectAndUpdate", "noActions"]
	},
	// Redirect (CFD)
	{
		result: "redirect",
		requireTarget: true,
		venues: ["cfd"],
		actions: ["noActions"]
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

	// Custom
	{
		result: "custom",
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["noActions"]
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
					label: "Delete talk pages",
					type: "toggleSwitch",
					venue: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
					sysopOnly: true
				},
				{
					label: "Tag talk pages for deletion",
					type: "toggleSwitch",
					venue: ["tfd"],
					nonSysopOnly: true
				},
				{
					label: "Delete redirects",
					type: "toggleSwitch",
					venue: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
				},
				{
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
					label: "Rcats",
					type: "rcatMulitSelect",
					venue: ["afd", "cfd", "mfd", "rfd", "tfd"]
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