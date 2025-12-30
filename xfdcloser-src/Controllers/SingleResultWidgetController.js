import { OO } from "../../globals";
// <nowiki>

export default class SingleResultWidgetController {
	constructor(model, widget) {
		this.model = model;
		this.model.connect(this, {update: "updateFromModel"});

		this.widget = widget;
		this.widget.buttonSelect.connect(this, {"select": "onButtonSelect"});
		this.widget.speedyOption.connect(this, {change: "onSpeedyChange"});
		this.widget.softOption.connect(this, {change: "onSoftChange"});
		this.widget.deleteFirstOption.connect(this, {change: "onDeleteFirstChange"});
		this.widget.targetInput.connect(this, {"change": "onTargetChange"});
		this.widget.customResultInput.connect(this, {"change": "onCustomResultChange"});
	}

	updateFromModel() {
		if ( this.widget.buttonSelect.getItems().length !== this.model.availableResults.length ) {
			this.widget.buttonSelect.clearItems();
			this.widget.buttonSelect.addItems(
				this.model.availableResults.map(result => new OO.ui.ButtonOptionWidget({
					data: { name: result.name },
					label: result.label,
					title: result.title
				}))
			);
		}
		this.widget.buttonSelect.selectItem(
			this.widget.buttonSelect.getItems().find(item => item.getData().name === this.model.selectedResultName)
		);
		this.widget.speedyOption
			.setSelected(this.model.speedyResult)
			.toggle(this.model.showSpeedyResult);
		this.widget.softOption
			.setSelected(this.model.softResult)
			.toggle(this.model.showSoftResult);
		this.widget.deleteFirstOption
			.setSelected(this.model.deleteFirstResult)
			.toggle(this.model.showDeleteFirstResult);
		this.widget.optionsMultiselect
			.toggle(this.model.showResultOptions);
		this.widget.targetInput
			.setValue(this.model.targetPageName)
			.toggle(this.model.showTarget)
			.setValidityFlag(this.model.targetIsValid);
		this.widget.customResultInput
			.setValue(this.model.customResultText)
			.toggle(this.model.showCustomResult)
			.setValidityFlag(this.model.customResultIsValid);
		this.widget.emit("update");
	}

	onButtonSelect(option) {
		this.model.setSelectedResultName(option && option.getData().name);
	}
	
	onSpeedyChange(isSelected) {
		this.model.setSpeedyResult(isSelected);
	}

	onSoftChange(isSelected) {
		this.model.setSoftResult(isSelected);
	}

	onDeleteFirstChange(isSelected) {
		this.model.setDeleteFirstResult(isSelected);
	}

	onTargetChange(value) {
		this.model.setTargetPageName(value);
	}

	onCustomResultChange(value) {
		this.model.setCustomResultText(value);
	}
}
// </nowiki>
