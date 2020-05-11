import UnlinkBacklinksTask from "../../Tasks/UnlinkBacklinksTask";
import UnlinkTaskController from "./UnlinkTaskController";
import API from "../../api";
import appConfig from "../../config";
// <nowiki>

function UnlinkTaskView(config, model) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	UnlinkTaskView.super.call( this, config );

	this.model = model;

	this.task = new UnlinkBacklinksTask({
		api: API,
		pages: [mw.Title.newFromText(this.model.pageName)],
		summaryReason: this.model.summary,
		appConfig: appConfig,
		venue: appConfig.venue
	});

	this.controller = new UnlinkTaskController(this.model, {
		task: this.task
	});

	this.content = new OO.ui.FieldsetLayout();
	this.content.addItems([this.task]);
	this.$element.append(this.content.$element);
}
OO.inheritClass( UnlinkTaskView, OO.ui.PanelLayout );

export default UnlinkTaskView;
// </nowiki>