import { mw } from "../../../globals";
import { rejection, makeLink, ymdDateString } from "../../util";
import TaskItemController from "../TaskItemController";
// <nowiki>

export default class AddToHoldingCell extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Listing at holding cell");
	}

	/**
	 * Remove `* ''None currently''` except if inside a <!--html comment-->, and trim
	 * 
	 * @param {String} wikitext section wikitext
	 * @returns {String} cleaned-up section wikitext
	 */
	static cleanupSection = wikitext => wikitext.replace(/\n*^\*\s*''None currently''\s*$(?![^<]*?-->)/gim, "").trim();

	/**
	 * @param {Number} total number of listings
	 * @param {Number} moduleCount number of modules listings
	 * @returns {String} description of page type(s) listed
	 */
	static typeListed = (total, moduleCount) => {
		switch(true) {
		case total === 1 && moduleCount === 0:
			return "template";
		case total === 1 && moduleCount === 1:
			return "module";
		case total === moduleCount:
			return "modules";
		case moduleCount === 0:
			return "templates";
		case total === 2 && moduleCount === 1:
			return "template and module";
		case total === moduleCount + 1:
			return "template and modules";
		default:
			return "templates and modules";
		}
	};

	transform(holdingCellPage) {
		if ( this.model.aborted ) return rejection("aorted");
		// Get page contents, split into section
		const sectionsArray = holdingCellPage.content.split(/\n={3,}/).map(section => {
			const headingSigns = /^[^=]+(=+)\n/.exec(section);
			if (!headingSigns) {
				return section;
			}
			return headingSigns[1] + section;
		});

		let changesMade = 0;
		let moduleCount = 0;

		this.model.getPageResults().forEach(pageResult => {
			const pageName = this.model.discussion.redirects.resolveOne(pageResult.pageName);
			const pageTitle = mw.Title.newFromText(pageName);
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
			const main = pageTitle.getMain(),
				dateString = ymdDateString(this.model.discussion.nominationDate),
				section = this.model.discussion.sectionHeader,
				deleteParam = options.holdcellSection === "ready" ? "|delete=1" : "",
				nsParam = pageTitle.getNamespaceId() === 828 ? "|ns=Module" : "",
				sectionNum = this.model.venue.holdingCellSectionNumber[options.holdcellSection || options.holdcellMergeSection];
			// Make new section wikitext
			sectionsArray[sectionNum] = AddToHoldingCell.cleanupSection(sectionsArray[sectionNum]) +
				`\n*{{tfdl|${main}|${dateString}|section=${section}${deleteParam}${nsParam}}}\n`;
			changesMade++;
			if ( nsParam ) moduleCount++;
		});

		if ( changesMade === 0 ) {
			return rejection("noChangesMade");
		}

		return {
			text: sectionsArray.join("\n"),
			summary: this.model.getEditSummary({prefix: `Listing ${AddToHoldingCell.typeListed(changesMade, moduleCount)}:`})
		};
	}

	doTask = function() {
		this.model.setTotalSteps(1);
		this.model.setDoing();
		return this.api.editWithRetry(
			this.model.venue.subpagePath + "Holding cell",
			null,
			page => this.transform(page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch(
			(errortype, code, error) => this.handleOverallError(errortype, code, error)
		);
	};
}
// </nowiki>