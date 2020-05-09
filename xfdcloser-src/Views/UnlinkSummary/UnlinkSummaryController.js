// <nowiki>
class UnlinkSummaryController {
	constructor(model, windowModel, widgets) {
		// Models
		this.model = model;
		this.windowModel = windowModel;
		// Widgets
		this.summaryInput = widgets.summaryInput;
		this.summaryInputField = widgets.summaryInputField;
		this.summaryPreview = widgets.summaryPreview;
		this.summaryPreviewField = widgets.summaryPreviewField;
		// Connect widgets and model
		this.model.connect(this, { update: "updateFromModel" });
		this.summaryInput.connect(this, {
			change: "onInputChange",
			enter: "onInputEnter"
		});
		// Ensure widgets reflect initial state of model
		this.updateFromModel();
	}
	updateFromModel() {
		this.summaryInput.setValue(this.model.summary);
		this.summaryInputField.setErrors(this.model.summaryErrors);
		if (this.model.parsedSummary) {
			const $preview = $("<p>").append(this.model.parsedSummary);
			$preview.find("a").attr("target", "_blank");
			this.summaryPreview.setLabel($preview);
		} else {
			this.summaryPreview.setLabel("");
		}
		this.summaryPreviewField.setErrors(this.model.parseErrors);
		this.windowModel.setSummary(this.model.summary);
		this.windowModel.setStartability(this.model.isValid);
	}
	onInputChange(value) {
		this.model.setSummaryValue(value);
	}
	onInputEnter() {
		if (this.model.isValid) {
			this.windowModel.startTask();
		}
	}
}

OO.initClass( UnlinkSummaryController );

export default UnlinkSummaryController;
// </nowiki>