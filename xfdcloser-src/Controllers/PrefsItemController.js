// <nowiki>

export default class PrefsItemController {
	constructor(model, widget) {
		this.model = model;
		this.model.connect(this, {update: "updateFromModel"});

		this.widget = widget;
		this.widget.selector.connect(this, {
			change: "onSelectorChange"
		});
		if ( model.type === "dropdown" ) {
			this.widget.selector.getMenu().connect(this, {
				choose: "onMenuSelection",
				select: "onMenuSelection"
			});
		}
		this.updateFromModel();
	}

	updateFromModel() {
		this.widget.fieldLayout.setLabel(this.model.label);
		this.widget.fieldLayout.setErrors(this.model.errors);
		this.widget.$element.find(".oo-ui-fieldLayout-messages").css("clear","both");
		if ( this.model.type === "dropdown" ) {
			this.widget.selector.getMenu().selectItemByData(this.model.value);
		} else {
			this.widget.selector.setValue(this.model.value);
		}
		this.widget.emit("update");
	}

	onSelectorChange(value) {
		this.model.setValue(value);
	}

	onMenuSelection(item) {
		this.model.setValue(item.getData());
	}
}
// </nowiki>
