import { mw } from "../../../globals";
import { rejection, makeLink } from "../../util";
import TaskItemController from "../TaskItemController";
// <nowiki>

export default class AddToCfdw extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Listing at working page");
	}

	/**
	 * Remove `* ''None currently''` except if inside a <!--html comment-->, and trim
	 * 
	 * @param {String} wikitext section wikitext
	 * @returns {String} cleaned-up section wikitext
	 */
	static cleanupSection = wikitext => wikitext.replace(/\n*^\*\s*''None currently''\s*$(?![^<]*?-->)/gim, "").trim();

	transform(workingPage) {
		if ( this.model.aborted ) return rejection("aborted");
		// Get page contents, split into section
		const sectionsArray = workingPage.content.split(/\n={2,}/).map(section => {
			const headingSigns = /^[^=]+(=+)\n/.exec(section);
			if (!headingSigns) {
				return section;
			}
			return headingSigns[1] + section;
		});
		const header = "\n; [["+ this.model.discussion.discussionPageLink+"]]";
		let changesMade = 0;
		let sectionHeader = {};
		this.model.getPageResults().forEach(pageResult => {
			const pageName = this.model.discussion.redirects.resolveOne(pageResult.pageName);
			const pageTitle = mw.Title.newFromText(pageName);
			const result = pageResult.selectedResultName;
			const sectionNum = this.model.venue.workingPageSectionNumber[result];
			const options = this.model.options.getOptionValues(pageResult.selectedResultName);
			const hasCorrectNamespace = this.model.venue.ns_number.includes(pageTitle.getNamespaceId());
			// Check namespace and existance
			if ( !hasCorrectNamespace ) {
				this.model.addError(
					`${makeLink(pageName)} is not in the expected namespace, and will not be listed at the holding cell`
				);
				return;
			} else if ( !pageTitle.exists() ) {
				this.model.addError(
					`${makeLink(pageName)} does not exist, and will not be listed at the holding cell`
				);
				return;
			}
			if (!sectionHeader[result]) {
				sectionHeader[result] = true;
				sectionsArray[sectionNum] = AddToCfdw.cleanupSection(sectionsArray[sectionNum]) + header;
			}
			let row;
			if (options.leaveRedirect || options.action === "cfdwRedirect") {
				row = "* REDIRECT ";
			} else {
				row = "* ";
			}
			row += "[[:" + pageName + "]]";
			if (pageResult.selectedResultName != "delete") {
				row += " to [[:" + pageResult.targetPageName + "]]";
			}
			// Make new section wikitext
			sectionsArray[sectionNum] = AddToCfdw.cleanupSection(sectionsArray[sectionNum]) + "\n" + row;
			sectionsArray[sectionNum] = sectionsArray[sectionNum].replace(/(<!--\s*End of list[^>]*-->)(.*)/si, "$2\n$1\n");
			changesMade++;
		});

		if ( changesMade === 0 ) {
			return rejection("noChangesMade");
		}

		return {
			text: sectionsArray.join("\n"),
			summary: this.model.getEditSummary({prefix: "Listing category:"})
		};
	}

	doTask = function() {
		this.model.setTotalSteps(1);
		this.model.setDoing();
		return this.api.queryWithContinue({
			titles: this.model.getResolvedPageNames(),
			prop: "categoryinfo"
		}).then(response => {
			if ( this.model.aborted ) {
				return rejection("aborted");
			} else if ( !response ) {
				this.model.addWarning("No categories found");
				return rejection("Skipped.");
			}
			return response.pages.map(page => {return page.categoryinfo.size;}).reduce((acc, num) => acc + num, 0);
		}).then(totalEdits => {
			let subpageName = "Working";
			if (totalEdits >= 5000) {
				return rejection("This category belongs at WP:CFDWL since over 5000 pages will be affected. Please add it there manually");
			}
			return subpageName;
		}).then(subpageName =>{
			return this.api.editWithRetry(
				"Wikipedia:Categories for discussion/" + subpageName,
				null,
				page => this.transform(page),
				() => this.model.trackStep(),
				(code, error, title) => this.handlePageError(code, error, title)
			).catch(
				(errortype, code, error) => this.handleOverallError(errortype, code, error)
			);}
		);
	};
}
// </nowiki>
