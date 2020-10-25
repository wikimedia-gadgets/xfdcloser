import { $ } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { rejection, isModule, makeLink, uniqueArray, normalisePageName } from "../../util";
// <nowiki>

/**
 * @private
 * @prop {String} from Name of page to be redirected
 * @prop {String} to Name of target page
 * @prop {Boolean} deleteFirst Delete before redirecting
 * @prop {Boolean} isSoft Is a soft redirection
 * @prop {String[]|null} rcats Wikitext of Rcat transclusions
 */
class Redirection {
	/**
	 * 
	 * @param {Object} config 
	 *  @param {String} config.from Name of page to be redirected
	 *  @param {String} config.to Name of target page
	 *  @param {Boolean} config.deleteFirst Delete before redirecting
	 *  @param {Boolean} config.isSoft Is a soft redirection
	 *  @param {Object} [config.options]
	 *   @param {String[]|null} [config.options.rcats] Wikitext of Rcat transclusions
	 */
	constructor(config) {
		this.from = config.from;
		this.to = config.to;
		this.deleteFirst = config.deleteFirst;
		this.isSoft = config.isSoft;
		this.rcats = config.options && config.options.rcats;
	}
}

export default class Redirect extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);

		const plural = this.model.pageNames.length > 1;
		const deleteFirst = this.redirections.find(redirection => redirection.deleteFirst);
		const label = deleteFirst
			? `Deleting ${plural ? "pages" : "page"} and replacing with ${plural ? "redirects" : "redirect"}`
			: `Replacing ${plural ? "pages" : "page"} with ${plural ? "redirects" : "redirect"}`;
		this.model.setName(label);
	}

	get redirections() {
		const targets = uniqueArray(
			this.model.getPageResults().map(pageResult => normalisePageName(pageResult.targetPageName))
		);
		return this.model.getPageResults()
			.filter(pageResult => {
				const resolvedPageName = this.model.discussion.redirects.resolveOne(pageResult.pageName);
				return !targets.includes(resolvedPageName);
			})
			.map(pageResult => new Redirection({
				from: this.model.discussion.redirects.resolveOne(pageResult.pageName),
				to: normalisePageName(pageResult.targetPageName),
				deleteFirst: pageResult.isDeleteFirst(),
				isSoft: pageResult.isSoft(),
				options: this.model.options.getOptionValues(pageResult.resultName)
			}));
	}

	/**
	 * 
	 * @param {Redirection} redirection
	 * @returns {Object<string,string>} {text, summary}
	 */
	transform(redirection) {
		if ( this.aborted && !redirection.deleteFirst ) return rejection("aborted");

		let text;
		const rcatshell = redirection.rcats && redirection.rcats.length
			? `\n\n{{Rcat shell|\n${redirection.rcats.join("\n")}\n}}`
			: "";
		if ( isModule(redirection.from) ) {
			if ( !isModule(redirection.to)) {
				return rejection("targetIsNotModule", {target: redirection.to});
			}
			text = `return require( "${redirection.to}" )`;
		} else if ( redirection.isSoft ) {
			text = `{{Soft redirect|${redirection.to}}}${rcatshell}`;
		} else {
			text = `#REDIRECT [[${redirection.to}]]${rcatshell}`;
		}
		return {
			text,
			summary: this.model.getEditSummary()
		};
	}

	/**
	 * 
	 * @param {Redirection} redirection 
	 * @returns {Promise} resolved if page was redirected
	 */
	redirect(redirection) {
		return this.api.editWithRetry(
			redirection.from,
			null,
			() => this.transform(redirection),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch((errortype, code, error) => {
			if (errortype === "read") {
				// "write" errors already handled via #handlePageError
				this.model.addError(`${code||"unknown"} error: Could not read contents of ${makeLink(redirection.from)}`);
				this.model.trackStep("failed");
				this.logError(code, error);
			}
		});
	}

	/**
	 * 
	 * @param {Redirection} redirection 
	 * @returns {Promise} resolved if page was deleted and redirected
	 */
	deleteAndRedirect(redirection) {
		return this.api.deleteWithRetry(
			redirection.from,
			{ reason: this.model.getEditSummary({short: true}) }
		).then(
			() => this.redirect(redirection),
			(_errortype, code, error) => {
				this.model.addError(`${code||"unknown"} error: Could not delete ${makeLink(redirection.from)}`);
				this.model.trackStep("failed");
				this.logError(code, error);
			}
		);
	}

	doTask() {
		this.model.setTotalSteps(this.redirections.length);
		this.model.setDoing();
		return $.when.apply(null,
			this.redirections.map(redirection => redirection.deleteFirst
				? this.deleteAndRedirect(redirection)
				: this.redirect(redirection)
			)
		);
	}
}
// </nowiki>