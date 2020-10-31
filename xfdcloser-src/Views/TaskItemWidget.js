import { OO } from "../../globals";
import AddBeingDeleted from "../Controllers/Tasks/AddBeingDeleted";
import AddMergeTemplates from "../Controllers/Tasks/AddMergeTemplates";
import AddOldXfd from "../Controllers/Tasks/AddOldXfd";
import AddToHoldingCell from "../Controllers/Tasks/AddToHoldingCell";
import CloseDiscussion from "../Controllers/Tasks/CloseDiscussion";
import DeletePages from "../Controllers/Tasks/DeletePages";
import DeleteRedirects from "../Controllers/Tasks/DeleteRedirects";
import DeleteTalkpages from "../Controllers/Tasks/DeleteTalkpages";
import Disambiguate from "../Controllers/Tasks/Disambiguate";
import GetRelistInfo from "../Controllers/Tasks/GetRelistInfo";
import Redirect from "../Controllers/Tasks/Redirect";
import RemoveCircularLinks from "../Controllers/Tasks/RemoveCircularLinks";
import RemoveNomTemplates from "../Controllers/Tasks/RemoveNomTemplates";
import TagTalkWithSpeedy from "../Controllers/Tasks/TagTalkWithSpeedy";
import UnlinkBacklinks from "../Controllers/Tasks/UnlinkBacklinks";
import UpdateDiscussion from "../Controllers/Tasks/UpdateDiscussion";
import UpdateNewLogPage from "../Controllers/Tasks/UpdateNewLogPage";
import UpdateNomTemplates from "../Controllers/Tasks/UpdateNomTemplates";
import UpdateOldLogPage from "../Controllers/Tasks/UpdateOldLogPage";
// <nowiki>

const controllers = {
	AddBeingDeleted, AddMergeTemplates, AddOldXfd, AddToHoldingCell, CloseDiscussion, DeletePages,
	DeleteRedirects, DeleteTalkpages, Disambiguate, GetRelistInfo, Redirect, RemoveCircularLinks,
	RemoveNomTemplates,	TagTalkWithSpeedy, UnlinkBacklinks, UpdateDiscussion, UpdateNewLogPage,
	UpdateNomTemplates, UpdateOldLogPage
};

/**
 * @class TaskItemWidget
 * @param {TaskItemModel} model
 */
function TaskItemWidget(model) {
	// Call parent constructor
	TaskItemWidget.super.call( this, {
		classes: ["xfdc-taskItemWidget"]
	} );

	this.model = model;

	// Widgets
	this.progressbar = new OO.ui.ProgressBarWidget();
	this.field = new OO.ui.FieldLayout(this.progressbar, {
		$element: this.$element
	});
	this.$element.find(".oo-ui-fieldLayout-messages").css("clear","both");
	this.showAllWarningsButton = new OO.ui.ButtonWidget({
		label: "Show warnings",
		icon: "alert"
	});
	this.showAllErrorsButton = new OO.ui.ButtonWidget({
		label: "Show errors",
		icon: "error",
		flags: "destructive"
	});
	this.$element.append(this.showAllWarningsButton.$element, this.showAllErrorsButton.$element);

	// Controller
	this.controller = new controllers[model.taskName](model, this);
	this.controller.updateFromModel();
}
OO.inheritClass( TaskItemWidget, OO.ui.Widget );

export default TaskItemWidget;
// </nowiki>