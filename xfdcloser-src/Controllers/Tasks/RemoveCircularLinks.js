import { mw } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { rejection, uniqueArray } from "../../util";
import unlink from "../../unlink";
// <nowiki>

export default class RemoveCircularLinks extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Unlinking circular links on redirect target");
	}

	get targets() {
		return uniqueArray(
			this.model.getPageResults()
				.map(pageResult => mw.Title.newFromText(pageResult.targetPageName).getPrefixedText()),
		);
	}

	get pageNamesToUnlink() {
		// Only pages which are not targets should be unlinked
		const targets = this.targets;
		return this.model.getPageResults()
			.filter(pageResult => {
				const resolvedPageName = this.model.discussion.redirects.resolveOne(pageResult.pageName);
				return !targets.includes(resolvedPageName);
			})
			.map(pageResult => pageResult.pageName);
	}

	transform(page) {
		if ( this.model.aborted ) return rejection("aborted");

		let newWikitext;
		try {
			newWikitext = this.model.venue.removeNomTemplate(page.content);
		} catch(e){
			// Error if multiple nom templates found
			return rejection("couldNotUpdate", e);
		}
		newWikitext = unlink(newWikitext, this.model.getResolvedPageNames());
		if ( newWikitext === page.content ) {
			// No links to unlink
			return rejection("skippedNoneFound");
		}
		return {
			text: newWikitext,
			summary: this.model.getEditSummary({prefix: "Unlinking circular redirects:"})
		};
	}

	doTask() {
		this.model.setTotalSteps(this.targets.length);
		this.model.setDoing();
		return this.api.editWithRetry(
			this.targets,
			null,
			page => this.transform(page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch(
			(errortype, code, error) => {
				if ( errortype === "read" ) {
					this.model.addError(code, error, 
						`Could not read contents of redirect ${this.targets.length > 1 ? "targets" : "targets"}`
					);
					return rejection();
				}
			});
	}
}
// </nowiki>