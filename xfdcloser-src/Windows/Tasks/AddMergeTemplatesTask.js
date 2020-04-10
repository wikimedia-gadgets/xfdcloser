import Task from "../Components/Task";
import {replaceNomTransform} from "./RemoveNomTemplatesTask";
// <nowiki>

function AddMergeTemplatesTask(config) {
	config = {
		label: "Adding merge templates",
		...config
	};
	// Call parent constructor
	AddMergeTemplatesTask.super.call( this, config );
}
OO.inheritClass( AddMergeTemplatesTask, Task );

AddMergeTemplatesTask.prototype.doTask = function() {
	const pageTitles = this.discussion.getPageTitles(this.pages, {"moduledocs": true});
	if ( pageTitles.length === 0 ) {
		this.addWarning("None found");
		return $.Deferred().resolve("Failed");
	}

	// Strings for merge templates
	const debate = this.discussion.getNomSubpage();
	const today = new Date();
	const curdate = `${today.getUTCDate()} ${this.appConfig.monthNames[today.getUTCMonth()]} ${today.getUTCFullYear()}`;

	const targets = extraJs.uniqueArray(
		this.formData.pageResults
			.filter(pageResult => pageResult.resultType === "merge")
			.map(pageResult => pageResult.data.target)
	).map(target => {
		const mergeFromPages = this.formData.pageResults
			.filter(pageResult => pageResult.data && pageResult.data.target === target );
		const mergeToTemplate = this.venue.wikitext.mergeTo
			.replace(/__TARGET__/, target)
			.replace(/__DEBATE__/, debate)
			.replace(/__DATE__/, curdate)		
			.replace(/__TARGETTALK__/, mw.Title.newFromText(target).getTalkPage().getPrefixedText());
		const mergeFromTemplates = mergeFromPages
			.map( mergeFromPageResult => this.venue.wikitext.mergeFrom
				.replace(/__NOMINATED__/, mergeFromPageResult.page.getPrefixedText())
				.replace(/__DEBATE__/, debate)
				.replace(/__DATE__/, curdate)
			).join("");
		const isNominatedPage = this.discussion.getPageTitles().includes(target);
		return { title:target, mergeToTemplate, mergeFromTemplates, isNominatedPage };
	});
	// filter out targets which are also nominated pages
	const filteredTargets = targets.filter(target => !this.discussion.getPageByTitle(target.title)); 

	this.setTotalSteps(pageTitles.length + filteredTargets.length);

	const transformTargetTalk = (page) => {
		// Check there is *not* a corresponding nominated page
		const pageObj = this.discussion.getPageByTalkTitle(page.title);
		if ( pageObj ) {
			return $.Deferred().reject("targetIsNominatedPage");
		}
		const targetText = mw.Title.newFromText(page.title).getSubjectPage().getPrefixedText();
		const target = targets.find(
			target =>  mw.Title.newFromText(target.title).getPrefixedText() === targetText
		);
		if (!target) {
			return $.Deferred().reject("targetNotFound");
		}
		return {
			prependtext: target.mergeFromTemplates,
			summary: `[[:${this.discussion.getNomPageLink()}]] closed as ${this.formData.resultWikitext} ${this.appConfig.script.advert}`
		};
	};

	const editTargetsTalkPromise = filteredTargets.length && this.api.editWithRetry(
		filteredTargets.map(
			target => mw.Title.newFromText(target.title).getTalkPage().getPrefixedText()
		),
		null,
		page => transformTargetTalk(page),
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title).get(0).outerHTML;
			switch(code) {
			case "targetIsNominatedPage":
				// Ignore
				this.trackStep();
				break;
			case "Unexpected title":
				this.addError(
					`API query result included unexpected title ${titleLink}; this page will not be edited`
				);
				this.trackStep({failed: true});
				break;
			case "targetNotFound":
				this.addError(
					`API query result included unexpected target talk page ${titleLink}; this page will not be edited`
				);
				break;
			case "doesNotExist":
				this.addError(
					`${titleLink} does not exist, and will not be edited`
				);
				this.trackStep({failed: true});
				break;
			case "nominationTemplateNotFound":
				this.addError(
					`Nomination template not found on page ${titleLink}`
				);
				this.trackStep({failed: true});
				break;
			case "couldNotUpdate":
				this.addError(
					`Could not update ${titleLink}: ${error.message}`
				);
				this.trackStep({failed: true});
				break;
			default:
				this.addError(
					`Could not edit page ${titleLink}`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		}
	).catch( (errortype, code, error) => {
		if ( errortype === "read" ) {
			this.addError(code, error, 
				`Could not read contents of target talk ${filteredTargets.length > 1 ? "pages" : "page"}`
			);
		}
		// Other errors already handled above
	} );

	const transformNom = (page) => {
		const pageResult = this.formData.pageResults.find(pageResult => page.title === pageResult.page.getPrefixedText());
		if (!pageResult){
			return $.Deferred().reject("Unexpected title");
		}
		const target = targets.find(target => target.title === pageResult.data.target);
		if (!target || !target.mergeToTemplate) {
			return $.Deferred().reject("Unexpected merge target");
		}
		return replaceNomTransform.call(this, page, target.mergeToTemplate);
	};

	const editNominatedPagesPromise = this.api.editWithRetry(
		pageTitles,
		null,
		page => transformNom(page),
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title).get(0).outerHTML;
			switch(code) {
			case "Unexpected title":
				this.addError(
					`API query result included unexpected title ${titleLink}; this page will not be edited`
				);
				this.trackStep({failed: true});
				break;
			case "doesNotExist":
				this.addError(
					`${titleLink} does not exist, and will not be edited`
				);
				this.trackStep({failed: true});
				break;
			case "nominationTemplateNotFound":
				this.addError(
					`Nomination template not found on page ${titleLink}`
				);
				this.trackStep({failed: true});
				break;
			case "couldNotUpdate":
				this.addError(
					`Could not update ${titleLink}: ${error.message}`
				);
				this.trackStep({failed: true});
				break;
			default:
				this.addError(
					`Could not edit page ${titleLink}`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		}
	).catch( (errortype, code, error) => {
		if ( errortype === "read" ) {
			this.addError(code, error, 
				`Could not read contents of nominated ${pageTitles.length > 1 ? "pages" : "page"}`
			);
		}
		// Other errors already handled above
	} );

	return $.when(editTargetsTalkPromise, editNominatedPagesPromise).then(() => {
		// All errors already handled above, just need to determine task status
		if (this.steps.completed === 0) {
			return "Failed";
		} else if (this.steps.completed < this.steps.total) {
			return "Done with errors";
		}
	});
};

export default AddMergeTemplatesTask;
// </nowiki>