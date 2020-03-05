/**
 * Static data
 */
// <nowiki>
const resultsData = [
	{
		result: "keep",
		allowSpeedy: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["keepActions", "noActions"]
	},
	{
		result: "delete",
		allowSpeedy: true,
		allowSoft: true,
		sysopOnly: true,
		venues: ["afd", "cfd", "ffd", "mfd", "rfd"],
		actions: ["deleteActions", "noActions"]
	},
	{
		result: "delete",
		allowSpeedy: true,
		allowSoft: true,
		venues: ["tfd"],
		actions: ["deleteActions", "holdingCellActions", "noActions"]
	},
	{
		result: "redirect",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		venues: ["afd", "cfd", "mfd", "tfd"],
		actions: ["redirectActions", "noActions"]
	},
	{
		result: "retarget",
		requireTarget: true,
		allowSoft: true,
		allowDeleteFirst: true,
		venues: ["rfd"],
		actions: ["redirectActions", "noActions"]
	},
	{
		result: "disambiguate",
		venues: ["rfd"],
		actions: ["keepActions", "noActions"]
	},
	{
		result: "merge",
		requireTarget: true,
		venues: ["afd", "cfd", "mfd"],
		actions: ["keepActions", "noActions"]
	},
	{
		result: "merge",
		requireTarget: true,
		venues: ["tfd"],
		actions: ["holdingCellActions", "noActions"]
	},
	{
		result: "no consensus",
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["keepActions", "noActions"]
	},
	{
		result: "custom",
		venues: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		actions: ["noActions"]
	}
];
const actions = [
	{
		data: "keepActions",
		label: "Update pages and talk pages"
	},
	{
		data: "deleteActions",
		label: "Delete pages and talk pages"
	},
	{
		data: "holdingCellActions",
		label: "List pages at holding cell"
	},
	{
		data: "redirectActions",
		label: "Redirect pages and talk pages"
	},
	{
		data: "noActions",
		label: "No automated actions"
	}
];
const options = [
	{
		label: "Rcats",
		type: "rcatMulitSelect",
		for: ["redirect", "retarget"],
		venue: ["afd", "cfd", "mfd", "rfd", "tfd"]
	},
	{
		label: "Delete talk pages",
		type: "toggleSwitch",
		for: ["delete"],
		venue: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
		sysopOnly: true
	},
	{
		label: "Tag talk pages for deletion",
		type: "toggleSwitch",
		for: ["delete"],
		venue: ["tfd"],
		nonSysopOnly: true
	},
	{
		label: "Delete redirects",
		type: "toggleSwitch",
		for: ["delete"],
		venue: ["afd", "cfd", "ffd", "mfd", "rfd", "tfd"],
	},
	{
		label: "Unlink backlinks",
		type: "toggleSwitch",
		for: ["delete"],
		venue: ["afd", "ffd"],
	},
	{
		label: "Use holding cell",
		type: "toggleSwitch",
		for: ["delete"],
		venue: ["tfd"],
		sysopOnly: true
	},
	{
		label: "Holding cell section",
		type: "dropdown",
		for: ["merge"],
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
	},
	{
		label: "Holding cell section",
		type: "dropdown",
		for: ["delete"],
		venue: ["tfd"],
		items: [
			{label: "Review", data:"review"},
			{label: "Convert", data:"convert"},
			{label: "Substitute", data:"substitute"},
			{label: "Orphan", data:"orphan"},
			{label: "Ready for deletion", data:"ready"}
		]
	}
];

export {resultsData, actions, options};
// </nowiki>