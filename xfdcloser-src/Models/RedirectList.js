import { mw } from "../../globals";

// Class for storing a list of redirects for a discussion, and for resolving redirects to their target
export default class RedirectList {
	/**
	 * Sets up the list of redirections
	 * @param {Object[]} redirections List of redirections (plain objects with `from` and `to` keys for page names)
	 *  @param {string} redirections[].from Name of page that has been redirected
	 *  @param {string} redirections[].to Name of page that is the redirect target
	 */
	constructor(redirections) {
		// List of redirects, which are plain objects with `from` and `to` keys for page names
		this.list = Array.isArray(redirections) ? redirections : [];
		this.list.forEach(redirection => {
			mw.Title.exist.set(mw.Title.newFromText(redirection.to).getPrefixedDb(), true);
		});
	}

	/**
	 * Takes a list of page names, and returns the same list
	 * but with any redirected pages resolved to their target page name. 
	 * 
	 * @param {string[]} pageNames Names of pages
	 * @returns {string[]} resolved page names
	 */
	resolve(pageNames) {
		return pageNames
			.map(pageName => {
				const redirect = this.list.find(redirect => redirect.from === pageName);
				return redirect ? redirect.to : pageName;
			});
	}

	/**
	 * Takes a single page names, and returns either the same page name
	 * if not a redirect, or the target page name if it is a redirect. 
	 * 
	 * @param {string} pageName Names of page
	 * @returns {string[]} resolved page names
	 */
	resolveOne(pageName) {
		return this.resolve([pageName])[0];
	}

	/**
	 * Takes a list of page names, and returns the list's talk
	 * pages names after resolving any redirects to their target page. Filters
	 * out pages which are themselves talk pages, or which cannot have talk
	 * pages.
	 * 
	 * @param {string[]} pagesNames names of pages
	 * @returns {string[]} resolved talk page names
	 */
	resolveTalks(pagesNames) {
		return this.resolve(pagesNames)
			.map(pageName => {
				const title = mw.Title.newFromText(pageName);
				return title && title.canHaveTalkPage() && !title.isTalkPage() && title.getTalkPage().getPrefixedText();
			})
			.filter(t => !!t);
	}

	/**
	 * Takes a single page name and returns either that page's talk page name
	 * if its not a redirect, or else the redirect target's talk page name.
	 * Filters out pages which are themselves talk pages, or which cannot have
	 * talk pages.
	 * 
	 * @param {string} pagesName name of page
	 * @returns {string[]} resolved talk page name
	 */
	resolveOneTalk(pagesName) {
		const resolved = this.resolveTalks([pagesName]);
		if (!resolved.length) {
			return [];
		}
		return resolved[0];
	}
	/**
	 * Takes a list of page names, and returns the same list
	 * but with any redirect targets unresolved to their "from" page name. 
	 * 
	 * @param {string[]} pageNames Names of pages
	 * @returns {string[]} unresolved page names
	 */
	unresolve(pageNames) {
		return pageNames
			.map(pageName => {
				const redirect = this.list.find(redirect => redirect.to === pageName);
				return redirect ? redirect.from : pageName;
			});
	}
	/**
	 * Takes a single page names, and returns either the same page name,
	 * or the "from" page name if it is a redirect target. 
	 * 
	 * @param {string} pageName Name of pages
	 * @returns {string[]} unresolved page name
	 */
	unresolveOne(pageName) {
		return this.unresolve([pageName])[0];
	}
}