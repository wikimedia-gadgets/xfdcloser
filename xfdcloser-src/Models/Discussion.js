
import { OO } from "../../globals";
import RedirectList from "./RedirectList";
import { makeLink, encodeForWikilinkFragment } from "../util";
// <nowiki>
class Discussion {
	/**
	 * 
	 * @param {Object} config
	 * @param {jQuery} config.$headlineSpan
	 * @param {String} config.id unique id
	 * @param {Venue} config.venue Venue
	 * @param {mw.Title[]} config.pages pages nominated for discussion
	 * @param {String} config.discussionPageName page name for the discussion, excluding any #fragment
	 * @param {String} config.sectionHeader text of discussion heading
	 * @param {String} config.sectionNumber edit section number for discussion
	 * @param {Date} config.firstCommentDate first timestamp within discussion
	 * @param {Boolean} config.isRelisted edit section number for discussion
	 * @param {Boolean} config.userIsSysop
	 */
	constructor(config) {
		// Call mixin constructor
		OO.EventEmitter.call(this);
		
		this.$headlineSpan = config.$headlineSpan;
		this.id = config.id;
		this.venue = config.venue;
		this.pages = config.pages || [];
		this.action = config.action || "";
		this.redirects = new RedirectList();
		this.discussionPageName = config.discussionPageName;
		this.sectionHeader = config.sectionHeader;
		this.sectionNumber = config.sectionNumber;
		this.firstCommentDate = config.firstCommentDate;
		this.isOld = config.isOld;
		this.isRelisted = config.isRelisted;
		this.userIsSysop = config.userIsSysop;
		this.classes = config.classes;
		this.status = "Loading...";
		this.showStatus = true;
	}
	get showButtons() {
		return !this.showStatus;
	}
	get showQuickClose() {
		return this.pages.length > 0;
	}
	get pagesNames() {
		return this.pages.map(page => page.getPrefixedText());
	}
	get discussionSubpageName() {
		return this.venue.hasIndividualSubpages
			? this.discussionPageName.replace(this.venue.subpagePath, "")
			: this.discussionPageName.replace(this.venue.path, "");
	}
	get discussionPageLink() {
		if ( this.venue.hasIndividualSubpages ) {
			return this.discussionPageName;
		}
		else {
			return this.discussionPageName + "#" + encodeForWikilinkFragment(this.sectionHeader);
		}
	}
	get talkpages() {
		return this.pages
			.filter(page => page.cahHaveTalkPage() && !page.isTalkPage())
			.map(page => page.getTalkPage());
	}
	get talkpagesNames() {
		return this.talkpages.map(page => page.getPrefixedText());
	}

	setRedirects(redirections) {
		this.redirects = new RedirectList(redirections);
	}

	setRelistInfo(relistInfo) {
		this.relistInfo = { ...relistInfo };
	}

	setNominationDate(nominationDate) {
		this.nominationDate = nominationDate;
		if ( !this.firstCommentDate ) {
			this.firstCommentDate = nominationDate;
		}
		this.emit("update");
	}

	setStatusReady() {
		if ( !this.userIsSysop && this.pages.length > 50 ) {
			this.status = "[XFDcloser: Too many pages for non-admin]";
		} else {
			this.status = "";
			this.showStatus = false;
		}
		this.emit("update");
	}

	setStatusError(code) {
		this.status = `${code || "unknown"} error retrieving page information (reload the page to try again)`;
		this.emit("update");
	}

	setWindowOpened(type) {
		this.type = type;
		this.status = type.slice(0,1).toUpperCase() + type.slice(1).replace(/e$/, "") + "ing discussion...";
		this.showStatus = true;
		this.emit("update");
	}

	setClosedWindowData(windowData) {
		switch (true) {
		case windowData && windowData.aborted:
			this.status = `<strong>Aborted</strong> during ${this.type}; check ${makeLink("Special:MyContributions", "your contributions")} to see which actions were already completed.`;
			break;
		case windowData && windowData.success: {
			const actioned = this.type.slice(0,1).toUpperCase() + this.type.slice(1).replace(/e$/, "") + "ed";
			const as = windowData.result ? ` as "${windowData.result}"` : "";
			this.status = `<strong>${actioned}</strong>${as} (reload page to see the actual ${this.type})`;
			this.actioned = true;
			break;
		}
		default: // cancelled
			this.setStatusReady();
			return;
		}
		this.finished = true;
		this.showStatus = true;
		this.emit("update");
	}

	startClosing() {
		// TODO

		this.emit("update");
	}

	startRelisting() {
		// TODO

		this.emit("update");
	}

	startQuickClosing(result) {
		// TODO
		console.log(result);
		this.emit("update");
	}
}
OO.initClass(Discussion);
OO.mixinClass(Discussion, OO.EventEmitter);

export default Discussion;
// </nowiki>