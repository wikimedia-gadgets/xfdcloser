import { $, mw, OO } from "../../globals";
import API from "../api";
import { dateFromSubpageName } from "../util"; 
import MainWindowModel from "../Models/MainWindowModel";
import windowManager from "../windowManager";

// <nowiki>
class DiscussionViewController {
	constructor(model, widget) {
		this.model = model;

		this.statusLabel = widget.statusLabel;
		this.buttonGroup = widget.buttonGroup;
		this.closeButton = widget.closeButton;
		this.relistButton = widget.relistButton;
		this.quickCloseButton = widget.quickCloseButtonMenu;
		this.quickCloseMenu = widget.quickCloseButtonMenu.getMenu();

		this.model.connect(this, {update: "updateFromModel"});

		this.closeButton.connect(this, {click: ["onButtonClick", "close"]});
		this.relistButton.connect(this, {click: ["onButtonClick", "relist"]});
		this.quickCloseMenu.connect(this, {choose: "onQuickCloseChoose"});

		if ( this.model.pages.length ) {
			this.fetchInfoFromApi();
		}
	}
	fetchInfoFromApi() {
		const pagesExistencesPromise = API.get({
			action: "query",
			format: "json",
			formatversion: 2,
			titles: this.model.pagesNames,
			prop: "info",
			inprop: "talkid"
		}).then(response => response.query.pages.forEach(page => {
			const pageTitle = mw.Title.newFromText(page.title);
			const talkpageTitle = pageTitle.getTalkPage();
			mw.Title.exist.set(pageTitle.getPrefixedDb(), !page.missing);
			if ( talkpageTitle ) {
				mw.Title.exist.set(talkpageTitle.getPrefixedDb(), !!page.talkid);
			}
		}));
		const nominationDatePromise = ( this.model.venue.type !== "afd" && this.model.venue.type !== "mfd" )
			? $.Deferred().resolve( dateFromSubpageName(this.model.discussionSubpageName) )
			: API.get({
				action: "query",
				format: "json",
				formatversion: 2,
				titles: this.model.discussionPageName,
				prop: "revisions",
				rvprop: "timestamp",
				rvdir: "newer",
				rvlimit: "1"
			}).then(response => {
				const page = response.query.pages[0];
				const timestamp = page.revisions[0].timestamp;
				return new Date(timestamp);
			});
		nominationDatePromise.then(nominationDate => {
			this.model.setNominationDate(nominationDate);
		});
		$.when(pagesExistencesPromise, nominationDatePromise)
			.then(() => { this.model.setStatusReady(); })
			.catch((code, error) => { this.model.setStatusError(code, error); });
	}

	updateFromModel() {
		this.statusLabel.setLabel(new OO.ui.HtmlSnippet(this.model.status)).toggle(this.model.showStatus);
		this.buttonGroup.toggle(this.model.showButtons);
		this.quickCloseButton.toggle(this.model.showQuickClose);
	}
	
	/**
	 * 
	 * @param {String} type "close" or "relist" 
	 */
	onButtonClick(type) {
		if ( windowManager.hasOpenWindow() ) {
			return false;
		}
		const windowInstance = windowManager.openWindow("main", {
			model: new MainWindowModel({
				type,
				discussion: this.model
			}),
			offsetTop: window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
		});
		windowInstance.closed.then(winData => {
			this.model.setClosedWindowData(winData);
		});
		this.model.setWindowOpened(type);
	}

	onQuickCloseChoose(menuOption) {
		const quickCloseResult = menuOption.getData();
		if ( windowManager.hasOpenWindow() ) {
			return false;
		}
		const windowModel = new MainWindowModel({
			type: "close",
			quick: true,
			result: quickCloseResult,
			discussion: this.model,
		});
		const windowInstance = windowManager.openWindow("main", {
			model: windowModel,
			offsetTop: window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
		});
		windowInstance.closed.then(winData => {
			this.model.setClosedWindowData(winData);
		});
		this.model.setWindowOpened("close");
		windowModel.result.singleModeResult.setSelectedResultName(quickCloseResult.replace("quick", "").toLowerCase());
		// If an option needs to be selected, show the options panel (e.g. holding cell section)
		if (!windowModel.options.isValid) {
			windowModel.showOptions();
		} else {
			// Just start doing the tasks
			windowModel.taskList.resetItems();
			windowModel.taskList.startTasks();
		}
	}
}

export default DiscussionViewController;