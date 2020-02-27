// <nowiki>

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

/**
 * 
 * @param {Object} config
 * @param {String} config.label Label heading, defaults to "Options"
 * @param {Object} config.resultData data object for result
 * @param {String} config.venue code for venue, e.g. "afd"
 * @param {Boolean} config.isSysop
 * @param {jQuery} config.$overlay element for overlays
 */
function OptionsWidget(config) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	OptionsWidget.super.call( this, config );
	this.data = {
		"resultData": config.resultData
	};
	this.venue = config.venue;
	this.isSysop = config.isSysop;

	this.fieldset = new OO.ui.FieldsetLayout( {
		label: config.label || "Options"
	} );

	this.actions = new OO.ui.DropdownWidget( {
		$overlay: config.$overlay,
		menu: {
			items: actions
				.filter(action => config.resultData.actions.includes(action.data))
				.map(action => new OO.ui.MenuOptionWidget(action))
		}
	} );

	this.options = options
		.filter(option => {
			if (option.sysopOnly && !config.isSysop) {
				return false;
			}
			if (option.nonSysopOnly && config.isSysop) {
				return false;
			}
			return option.for.includes(config.resultData.result) && option.venue.includes(config.venue);
		})
		.map(option => {
			let widget;
			switch(option.type) {
			case "toggleSwitch":
				widget = new OO.ui.ToggleSwitchWidget();
				break;
			case "dropdown":
				widget = new OO.ui.DropdownWidget({
					$overlay: config.$overlay,
					menu: {
						items: option.items.map(item =>  new OO.ui.MenuOptionWidget(item))
					}
				});
				break;
			case "rcatMulitSelect":
				//widget = new rcatMulitSelect();
				widget = new OO.ui.DropdownInputWidget({});//TODO: Replace with rcat multiselect
				break;
			default:
				throw new Error("Unrecognised option type: " + option.type);
			}
			return {
				label: option.label,
				widget: widget
			};
		});

	this.fieldset.addItems( [
		new OO.ui.FieldLayout( this.actions, {
			label: "Actions"
		} ),
		...this.options.map(option => new OO.ui.FieldLayout( option.widget, {
			label: option.label
		} ))
	] );

	this.$element.append(this.fieldset.$element);
}
OO.inheritClass( OptionsWidget, OO.ui.Widget );

export default OptionsWidget;
// </nowiki>