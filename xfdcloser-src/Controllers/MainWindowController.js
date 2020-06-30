import { $, OO } from "../../globals";
import { rejection, makeLink } from "../util";
import * as prefs from "../prefs";
// <nowiki>

//const getElementHeight = element => element && $(element).outerHeight(true);
//const sum = (a, b) => Number(a) + Number(b);

/**
 * Controller linking window actions and views stackLayout with the model
 *
 * @param {MainWindowModel} model
 * @param {Object} widgets
 * @param {OO.ui.StackLayout} widgets.stackLayout
 */
class MainWindowController {
	constructor(model, window) {
		// Model
		this.model = model;
		// Widgets
		this.window = window;
		this.stackLayout = window.stackLayout;
		this.actions = window.actions;
		// Connect widgets and model
		this.model.connect(this, {
			update: "updateFromModel",
			resize: this.window.updateSize.bind(this.window)
		});
		// Ensure widgets reflect initial state of model
		//this.updateFromModel();
	}
	// Update view (widgets) from model changes
	updateFromModel() {
		this.actions.setMode(this.model.mode);
		this.actions.setAbilities(this.model.actionAbilities);
		const currentPanel = this.stackLayout.findItemFromData({ name: this.model.currentPanel });
		if (!currentPanel) {
			throw new Error("Could not find panel with name: "+this.model.currentPanel);
		}
		this.stackLayout.setItem( currentPanel );
		this.model.suggestCurrentPanelHeight(currentPanel.$element.get(0).scrollHeight + 1/* + 24 */);
	}
	getActionProcess(action) {
		this.window.setErrorsLabels();
		if ( action !== "save" ) {
			this.model.sanityChecks.setShowWarnings(true);
			this.model.sanityChecks.setShowRedirections(true);
		}
		if ( action === "save" ) {
			return new OO.ui.Process()
				.next(() => { // Sanity warnings
					const sanityWarnings = this.model.sanityChecks.showWarnings && this.model.sanityChecks.getWarnings();
					if ( sanityWarnings ) {
						this.model.sanityChecks.setShowWarnings(false);
						this.window.setErrorsLabels({title:"Warning", dismiss:"Cancel"});
						return sanityWarnings.map(message => new OO.ui.Error(
							$(`<div>${message}</div>`),
							{ warning: true }
						));
					}
					return 0;
				})
				.next(() => { // Redirection warnings
					if ( !this.model.sanityChecks.showRedirections ) {
						return 0;
					}
					return this.model.sanityChecks.getRedirections().then(redirections => {
						this.model.sanityChecks.setShowRedirections(false);
						if ( !redirections.length ) {
							return 0;
						}
						this.window.setErrorsLabels({title:"Redirection warning", dismiss:"Cancel"});
						const explanation = `Actions will be applied to ${redirections.length === 1
							? "this redirect's <strong>target page</strong>"
							: "these redirects' <strong>target pages</strong>"
						}. To use the nominated ${redirections.length === 1
							? "page" : "pages"
						} instead, undo the redirection before continuing.`;
						const listItems = redirections
							.map(redirect => `<li>${makeLink(redirect.from)} → ${makeLink(redirect.to)}</li>`)
							.join("");
						return rejection(new OO.ui.Error(
							$(`<div>${explanation}<ul>${listItems}</ul></div>`),
							{ warning: true }
						));
					});
				})
				.next(() => {
					if ( this.model.discussion.venue.expectRedirects ) {
						return 0;
					}
					return this.model.sanityChecks.getRedirections({setExistences: true});
				})
				.next(() => {
					this.model.startTasks();
				});
		} else if ( action === "showPrefs" ) {
			this.model.showPrefs();	
		} else if ( action === "savePrefs" ) {
			this.window.pushPending();
			const changedPrefValues = this.model.preferences.getValues({changedOnly: true});
			return new OO.ui.Process()
				.next(() => prefs.set(changedPrefValues))
				.next(() => {
					this.model.preferences.resetValues(changedPrefValues);
					this.model.closePrefs();
					this.window.popPending();
				});
		} else if ( action === "closePrefs" ) {
			this.model.closePrefs();
		} else if ( action === "defaultPrefs" ) {
			this.model.preferences.restoreDefaults();
		} else if ( action === "multimode" ) {
			this.model.setMultimode(true);
		} else if ( action === "singlemode" ) {
			this.model.setMultimode(false);
		} else if ( action === "next" ) {
			this.model.showOptions();		
		} else if ( action === "back" ) {
			this.model.showResult();	
		} else if ( action === "finish" ) {
			this.window.close( {
				success: this.model.success,
				aborted: this.model.aborted,
				result: this.model.type !== "relist" && this.model.resultViewModel.getFormattedResult()
			} );	
		} else if ( action === "abort" ) {
			this.model.abortTasks();
		} else if ( !action && this.model.canClose ) {
			this.window.close();
		}
		return new OO.ui.Process();
	}
}

export default MainWindowController;
// </nowiki>


