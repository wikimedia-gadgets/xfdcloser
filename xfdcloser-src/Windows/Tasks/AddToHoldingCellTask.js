import Task from "../Components/Task";
import { hasCorrectNamespace } from "../../util";
// <nowiki>

function AddToHoldingCellTask(config) {
	config = {
		label: "Listing at holding cell",
		...config
	};
	// Call parent constructor
	AddToHoldingCellTask.super.call( this, config );
}
OO.inheritClass( AddToHoldingCellTask, Task );

/**
 * Remove `* ''None currently''` except if inside a <!--html comment-->, and trim
 * 
 * @param {String} wikitext section wikitext
 * @returns {String} cleaned-up section wikitext
 */
const cleanupSection = wikitext => wikitext.replace(/\n*^\*\s*''None currently''\s*$(?![^<]*?-->)/gim, "").trim();

const isTrue = val => val === true;

AddToHoldingCellTask.prototype.doTask = function() {
	this.setTotalSteps(1);
	
	const transform = holdingCellPage => {
		// Get page contents, split into section
		const sectionsArray = holdingCellPage.content.split(/\n={3,}/).map(section => {
			const headingSigns = /^[^=]+(=+)\n/.exec(section);
			if (!headingSigns) {
				return section;
			}
			return headingSigns[1] + section;
		});

		const addTfdlTemplate = pageResult => {
			const page = pageResult.page;
			const pageLink = extraJs.makeLink(page.getPrefixedText()).get(0).outerHTML;
			// Check namespace and existance
			if ( !hasCorrectNamespace(page) ) {
				const expectedNamespace = this.appConfig.mw.namespaces[ this.venue.ns_number[0].toString() ];
				this.addError(
					`${pageLink} is not in the ${expectedNamespace} namespace, and will not be listed at the holding cell`
				);
				return false;
			} else if ( !page.exists() ) {
				this.addError(
					`${pageLink} does not exist, and will not be listed at the holding cell`
				);
				return false;
			} else {
				const tfdlTemplate = `\n*{{tfdl|${page.getMain()}|${this.discussion.nomDate}|section=${this.discussion.sectionHeader}${
					pageResult.options.holdcellSection === "ready" ? "|delete=1" : ""
				}${
					page.getNamespaceId() === 828 ? "|ns=Module" : ""
				}}}\n`;
				const sectionNum = this.venue.holdingCellSectionNumber[pageResult.options.holdcellSection];
				// Make new section wikitext
				sectionsArray[sectionNum] = cleanupSection(sectionsArray[sectionNum]) + tfdlTemplate;
				return true;
			}
		};

		const changesMade = this.pageResults.map( addTfdlTemplate ).filter( isTrue ).length;
		if ( !changesMade ) {
			return $.Deferred().reject("noChangesMade");
		}

		return {
			text: sectionsArray.join("\n"),
			summary: `Listing ${changesMade > 1 ? "templates" : "template"} per [[:${this.discussion.getNomPageLink()}]] ${this.appConfig.script.advert}`
		};
	};
	
	return this.api.editWithRetry(
		`${this.venue.subpagePath}Holding cell`,
		null,
		page => transform(page),
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title, "holding cell").get(0).outerHTML;
			switch(code) {
			case "noChangesMade":
				this.addError(
					`Did not find any changes to make to the ${titleLink}`
				);
				this.trackStep({failed: true});
				break;
			default:
				this.addError(
					`Could not add templates to the ${titleLink}`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		}
	).catch( (errortype, code, error) => {
		if ( errortype === "read" ) {
			this.addError(
				"Could not read contents of holding cell",
				{code, error}
			);
			return "Failed";
		}
		// Other errors already handled above
	} );
};

export default AddToHoldingCellTask;
// </nowiki>