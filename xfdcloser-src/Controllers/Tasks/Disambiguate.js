import TaskItemController from "../TaskItemController";
import { rejection, docToModule, makeLink } from "../../util";
// <nowiki>

export default class Disambiguate extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName(`Updating ${model.pageNames.length > 1 ? "pages" : "page"}`);
	}

	transform(page) {
		// Check if aborted, and if there's a corresponding nominated page, and the page exists
		if ( this.model.aborted ) {
			return rejection("aborted");
		} else if ( !this.model.getResolvedPageNames().includes(docToModule(page.title)) ) {
			return rejection("unexpectedTitle");
		} else if ( page.missing ) {
			return rejection("doesNotExist");
		}

		let updatedWikitext = page.content.replace(this.model.venue.regex.fullNomTemplate, "");
		if ( updatedWikitext === page.content ) {
			this.model.addWarning(`Nomination template not found on page ${makeLink(page.title)}`);
			updatedWikitext = page.content.replace(/^#REDIRECT/mi, "*");
		}
		const hasDisambigTemplate = /(?:disambiguation|disambig|dab|Mil-unit-dis|Numberdis)[^{]*}}/i.test(updatedWikitext);	
		return {
			text: hasDisambigTemplate
				? updatedWikitext.trim()
				: updatedWikitext.trim() + "\n{{Disambiguation cleanup|{{subst:DATE}}}}",
			summary: this.model.getEditSummary()
		};
	}

	doTask() {
		const pageNames = this.model.getResolvedPageNames();
		if ( pageNames.length === 0 ) {
			this.model.addWarning("None found");
			return rejection();
		}
		this.model.setTotalSteps(pageNames.length);
		this.model.setDoing();
		return this.api.editWithRetry(
			pageNames,
			null,
			page => this.transform(page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch(
			(errortype, code, error) => this.handleOverallError(errortype, code, error)
		);
	}
}
// </nowiki>