import { $, OO } from "../../globals";
import API from "../api";
import appConfig from "../config";
import { timeout } from "../util";
// <nowiki>

class UnlinkSummaryPanelController {
	constructor(model, widget) {
		this._requestId = 0;
		// Models
		this.model = model;
		// Widgets
		this.summaryInput = widget.summaryInput;
		this.summaryInputField = widget.summaryInputField;
		this.summaryPreview = widget.summaryPreview;
		this.summaryPreviewField = widget.summaryPreviewField;
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
		if (this.model.parsedSummary && this.model.summaryIsValid) {
			const $preview = $("<p>").append(this.model.parsedSummary);
			$preview.find("a").attr("target", "_blank");
			this.summaryPreview.setLabel($preview);
		} else {
			this.summaryPreview.setLabel("");
		}
		this.summaryPreviewField.setErrors(this.model.parseErrors);
	}
	onInputChange(value) {
		this.model.setSummary(value);
		const requestId = ++this._requestId;
		// Wait for a short delay and check if this is still the latest requestId,
		// to avoid making unnessary api calls.
		timeout(this._delay).then(() => {
			if (requestId < this._requestId || !this.model.summaryIsValid)
				return;
			API.get({
				action: "parse",
				contentmodel: "wikitext",
				summary: `Removing link(s) because ${this.model.summary} ${appConfig.script.advert}`,
				prop: "text",
				disablelimitreport: 1,
				format: "json",
				formatversion: "2"
			}).then(result => {
				// Prevent older requests overwriting newer requests
				if (requestId < this._requestId || !this.model.summaryIsValid) {
					return;
				}
				this.model.setParsedSummary(result.parse.parsedsummary);
			}, errorCode => {
				// Prevent older requests overwriting newer requests
				if (requestId < this._requestId || !this.model.summaryIsValid) {
					return false;
				}
				this.model.setParseError(errorCode);
			});
		});
	}
	onInputEnter() {
		this.model.onInputEnter();
	}
}
OO.initClass( UnlinkSummaryPanelController );

export default UnlinkSummaryPanelController;
// </nowiki>
