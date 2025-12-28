import { $, mw, OO } from "../../globals";
import { uniqueArray, makeLink } from "../util";
import API from "../api";
// <nowiki>

class SanityChecks {
	/**
	 * 
	 * @param {Object} config
	 *  @param {Discussion} config.discussion
	 *  @param {Result} config.result
	 *  @param {Options} config.options
	 */
	constructor(config) {
		// call mixin constructors
		OO.EventEmitter.call(this);

		this.discussion = config.discussion;
		this.result = config.result;
		this.options = config.options;

		this.showWarnings = true;
		this.showRedirections = true;

		this.result.connect(this, {update: "resetShowAll"});
		this.options.connect(this, {update: "resetShowAll"});
	}

	/**
	 * 
	 * @param {boolean} isOld 
	 * @param {boolean} isRelisted
	 * @returns {String[]} Warnings, or empty array if there are no warnings
	 */
	static date(isOld, isRelisted) {
		if ( !isOld && !isRelisted ) {
			return ["It has not yet been 7 days since the discussion was listed."];
		}
		return [];
	}

	/**
	 * 
	 * @param {string[]} actions 
	 * @param {number} numPages
	 * @returns {string[]} Warnings, or empty array if there are no warnings
	 */
	static massActions(actions, numPages) {
		if ( actions.some(action => action !== "noActions") && numPages > 3) {
			return [`Mass actions will be peformed (${numPages} nominated pages detected).`];
		}
		return [];
	}

	/**
	 * 
	 * @param {String[]} pageNames 
	 * @param {Number[]|null} expectedNamespaceNumbers
	 * @returns {String[]} Warnings, or empty array if there are no warnings
	 */
	static nominatedPagesNamespaces(pageNames, expectedNamespaceNumbers) {
		if ( !expectedNamespaceNumbers || !expectedNamespaceNumbers.length ) {
			return [];
		}
		const warnPages = pageNames
			.filter( pageName => !expectedNamespaceNumbers.includes(mw.Title.newFromText(pageName).getNamespaceId()) )
			.map( pageName => `<li>${makeLink(pageName)}</li>`);
		if ( !warnPages.length ) {
			return [];
		}
		return [`The following pages are not in the expected namespace:<ul>${warnPages.join("")}</ul>`];
	}

	/**
	 * 
	 * @param {String[]} targets 
	 * @param {Number[]|null} expectedNamespaceNumbers
	 * @returns {String[]} Warnings, or empty array if there are no warnings
	 */
	static targetsNamespaces(targets, expectedNamespaceNumbers) {
		if ( !expectedNamespaceNumbers || !expectedNamespaceNumbers.length ) {
			return [];
		}
		return uniqueArray(targets)
			.filter( target => !!target && !expectedNamespaceNumbers.includes(mw.Title.newFromText(target).getNamespaceId()) )
			.map( target => `Target page ${makeLink(target)} is not in the expected namespace.`);
	}

	/**
	 * @returns {String[]}
	 */
	getWarnings() {
		const actions = this.options.getOptions().map(optionItem => optionItem.selectedAction);
		const targets = this.result.getResultsByPage().flatMap(pageResult => {
			return pageResult.showTarget && pageResult.targetPageName || [];
		});
		const expectedNamespaces = this.discussion.venue.ns_number;
		return [
			...SanityChecks.date(this.discussion.isOld, this.discussion.isRelisted),
			...SanityChecks.massActions(actions, this.discussion.pages.length),
			...SanityChecks.nominatedPagesNamespaces(this.discussion.pagesNames, expectedNamespaces),
			...SanityChecks.targetsNamespaces(targets, expectedNamespaces)
		];
	}

	/**
	 * @param {Object} options
	 *  @param {boolean} options.setExistences Set existence of pages (after resolving redirects), and their talk pages if applicable
	 * @returns {Promise<Object<string,string>[]>} {from, to}[]
	 */
	getRedirections(options) {
		if ( this.discussion.venue.expectRedirects ) {
			return $.Deferred().resolve([]);
		}
		return API.get({
			action: "query",
			titles: this.discussion.pagesNames,
			redirects: 1,
			prop: "info",
			inprop: "talkid",
			format: "json",
			formatversion: "2"
		}).then( response => {
			if ( options && options.setExistences )
				response.query.pages.forEach(page => {
					const title = mw.Title.newFromText(page.title);
					mw.Title.exist.set(title.getPrefixedDb(), !page.missing);
					if ( title.canHaveTalkPage() && !title.isTalkPage() ) {
						mw.Title.exist.set(title.getTalkPage().getPrefixedDb(), !!page.talkid);
					}
				});
			return response && response.query && response.query.redirects || [];
		});
	}

	setShowWarnings(show) {
		this.showWarnings = !!show;
		this.emit("update");
	}

	setShowRedirections(show) {
		this.showRedirections = !!show;
		this.emit("update");
	}

	resetShowAll() {
		this.showWarnings = true;
		this.showRedirections = true;
		this.emit("update");
	}

}
OO.initClass( SanityChecks );
OO.mixinClass( SanityChecks, OO.EventEmitter );

export default SanityChecks;
// </nowiki>
