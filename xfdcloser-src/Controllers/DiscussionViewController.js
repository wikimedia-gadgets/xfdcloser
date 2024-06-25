import { $, mw, OO } from "../../globals";
import API from "../api";
import { dateFromSubpageName, windowOffsetTop } from "../util"; 
import MainWindowModel from "../Models/MainWindowModel";
import windowSetManager from "../windowSetManager";

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
		const pageNames = this.model.pagesNames;
		const chunkSize = pageNames.length <= 100 ? 50 : (await mw.user.getRights()).indexOf( 'apihighlimits' ) >= 0 ? 500 : 50;

		const chunks = [];
		for (let i = 0; i < pageNames.length; i += chunkSize) {
			chunks.push(pageNames.slice(i, i + chunkSize));
		}

		const fetchChunk = (chunk) => {
			return API.get({
				action: "query",
				format: "json",
				formatversion: 2,
				titles: chunk.join('|'),
				prop: "info",
				inprop: "talkid"
			}).then(response => {
				if (response.query && response.query.pages) {
					response.query.pages.forEach(page => {
						const pageTitle = mw.Title.newFromText(page.title);
						const talkpageTitle = pageTitle.getTalkPage();
						mw.Title.exist.set(pageTitle.getPrefixedDb(), !page.missing);
						if (talkpageTitle) {
							mw.Title.exist.set(talkpageTitle.getPrefixedDb(), !!page.talkid);
						}
					});
				}
			})
		};

		const fetchPromises = chunks.map(chunk => fetchChunk(chunk));
		const pagesExistencesPromise = Promise.all(fetchPromises);
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
		if (this.model.actioned) {
			this.model.$headlineSpan.addClass("xfdc-actioned-heading");
			$(`.${this.model.id}-discussion-node`).addClass("xfdc-actioned-discussion");
		}
	}
	
	/**
	 * 
	 * @param {String} type "close" or "relist" 
	 */
	onButtonClick(type) {
		const windowInstance = windowSetManager.openWindow("main", {
			model: new MainWindowModel({
				type,
				discussion: this.model
			}),
			offsetTop: windowOffsetTop()
		});
		windowInstance.closed.then(winData => {
			this.model.setClosedWindowData(winData);
		});
		this.model.setWindowOpened(type);
	}

	onQuickCloseChoose(menuOption) {
		const quickCloseResult = menuOption.getData();
		const windowModel = new MainWindowModel({
			type: "close",
			quick: true,
			result: quickCloseResult,
			discussion: this.model,
		});
		const windowInstance = windowSetManager.openWindow("main", {
			model: windowModel,
			offsetTop: windowOffsetTop()
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