import { mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { rejection, moduleToDoc, docToModule } from "../../util";
// <nowiki>

export default class RemoveNomTemplates extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName(`Updating ${model.pageNames.length > 1 ? "pages" : "page"}`);
	}

	/**
	 * Transform a page object into edit parameters for removing a nomination
	 * template, and optionally prepending addtional content. This is a static
	 * method so that it can be exported and used with a different context.
	 * 
	 * @param {TaskItemController} context Context to use for the `this` value
	 * @param {Object} page Api page object
	 * @param {String} [prependContent] Additional content to prepend to transformed text
	 * @returns {Object<string,string>|Promise} {text, summary} or promise rejected with error code
	 */
	static transform(context, page, prependContent) {
		prependContent = prependContent || "";
		if ( context.aborted ) return rejection("aborted");

		// Check there's a corresponding nominated page
		const unresolvedPageName = context.model.discussion.redirects.unresolveOne(docToModule(page.title));
		const title = context.model.discussion.pages.find(
			page => page.getPrefixedText() === unresolvedPageName
		);
		if ( !title ) {
			return rejection("unexpectedTitle");
		}
		// Check corresponding page exists
		if ( page.missing || !mw.Title.newFromText(docToModule(page.title)).exists() ) {
			return rejection("doesNotExist");
		}

		if ( !prependContent && !context.model.venue.hasNomTemplate(page.content) ) {
			// Skip - nothing to change
			return rejection("nominationTemplateNotFound");
		}
		
		// Start building updated wikitext
		let text;
		try {
			// Remove nom template
			text = prependContent + context.model.venue.removeNomTemplate(page.content);
		} catch(e){
			// Error if multiple nom templates found
			return rejection("couldNotUpdate", e);
		}
		return {
			text,
			summary: context.model.getEditSummary()
		};
	}

	doTask() {
		this.model.setTotalSteps(this.model.pageNames.length);
		this.model.setDoing();
		return this.api.editWithRetry(
			this.model.getResolvedPageNames().map(moduleToDoc),
			null,
			page => RemoveNomTemplates.transform(this, page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch(
			(errortype, code, error) => this.handleOverallError(errortype, code, error)
		);
	}
}
// </nowiki>
