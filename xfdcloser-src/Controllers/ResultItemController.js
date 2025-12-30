import { OO } from "../../globals";
// <nowiki>

export default class ResultItemController {
	constructor(model, widget) {
		this.model = model;
		this.model.connect(this, {update: "updateFromModel"});

		this.widget = widget;
		this.widget.resultDropdown.getMenu().connect(this, {"choose": "onResultChoose"});
		this.widget.targetInput.connect(this, {"change": "onTargetChange"});
		this.widget.customResultInput.connect(this, {"change": "onCustomResultChange"});
	}

	updateFromModel() {
		const dropdownMenu = this.widget.resultDropdown.getMenu();
		if ( dropdownMenu.items.length !== this.model.availableResults.length) {
			dropdownMenu.clearItems();
			dropdownMenu.addItems(
				this.model.availableResults.map(result => new OO.ui.MenuOptionWidget({
					data: { name: result.name },
					label: result.label,
					title: result.title
				}))
			);
		}
		dropdownMenu.selectItem(
			dropdownMenu.getItems().find(item => item.getData().name === this.model.selectedResultName)
		);
		this.widget.resultField.setLabel(this.model.pageName);
		this.widget.targetInput.setValue(this.model.targetPageName);
		this.widget.targetInput.setValidityFlag(this.model.targetIsValid);
		this.widget.targetField.toggle(this.model.showTarget);
		this.widget.customResultInput.setValue(this.model.customResultText);
		this.widget.customResultInput.setValidityFlag(this.model.customResultIsValid);
		this.widget.customField.toggle(this.model.showCustomResult);

		this.widget.emit("update");
	}

	onResultChoose(option) {
		this.model.setSelectedResultName(option && option.getData().name);
	}

	onTargetChange(value) {
		this.model.setTargetPageName(value);
	}

	onCustomResultChange(value) {
		this.model.setCustomResultText(value);
	}
}
// </nowiki>
