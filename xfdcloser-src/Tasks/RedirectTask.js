import Task from "../Components/Task";
import { rejection } from "../util";
// <nowiki>

function RedirectTask(config) {
	const plural = config.pageResults.length > 1;
	this.deleteFirst = config.resultOptions && config.resultOptions.deleteFirst;
	this.softResult = config.resultOptions && config.resultOptions.soft;
	const label = this.deleteFirst
		? `Deleting ${plural ? "pages" : "page"} and replacing with ${plural ? "redirects" : "redirect"}`
		: `Replacing ${plural ? "pages" : "page"} with ${plural ? "redirects" : "redirect"}`;
	config = { label, ...config };
	// Call parent constructor
	RedirectTask.super.call( this, config );
	// For RFD use "retarget" terminology
	if (this.venue.type === "rfd") {
		this.setLabel( this.deleteFirst
			? `Deleting and retargeting ${plural ? "redirects" : "redirect"}`
			: `Retargeting ${plural ? "redirects" : "redirect"}`
		);
	}
}
OO.inheritClass( RedirectTask, Task );

RedirectTask.prototype.doTask = function() {
	const targets = extraJs.uniqueArray(
		this.pageResults.map(pageResult => pageResult.data.target)
	);
	const relevantPageResults = this.pageResults
		.filter(pageResult => !targets.includes(pageResult.page.getPrefixedText()));
	this.setTotalSteps(relevantPageResults.length);

	const redirectPage = pageResult => this.api.editWithRetry(
		pageResult.page.getPrefixedText(),
		null,
		() => {
			if (this.aborted && !this.deleteFirst) return rejection("Aborted");

			let text;
			const rcatshell = pageResult.options.rcats && pageResult.options.rcats.length
				? `\n\n{{Rcat shell|\n${pageResult.options.rcats.join("\n")}\n}}`
				: "";
			if ( pageResult.page.getNamespaceId() === 828 /* Module */ ) {
				if ( pageResult.data.target.indexOf("Module:") !== 0 ) {
					return $.Deferred().reject("notModule", {target:pageResult.data.target});
				}
				text = `return require( "${pageResult.data.target}" )`;
			} else if ( this.softResult ) {
				text = `{{Soft redirect|${pageResult.data.target}}}${rcatshell}`;
			} else {
				text = `#REDIRECT [[${pageResult.data.target}]]${rcatshell}`;
			}
			return {text, summary:`${this.venue.type.toUpperCase()} closed as ${this.result} ${this.appConfig.script.advert}`};
		},
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title).get(0).outerHTML;
			const target = error.target ? `${extraJs.makeLink(error.taregt).get(0).outerHTML}` : "target";
			switch(code) {
			case "notModule":
				this.addError(
					`Could not redirect ${titleLink} because ${target} is not a module`
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
				`Could not read contents of ${extraJs.makeLink(pageResult.page.getPrefixedText()).get(0).outerHTML}`
			);
		}
		// Other errors already handled above
	} );
	
	const deleteAndRedirectPage = pageResult => this.api.deleteWithRetry(
		pageResult.page.getPrefixedText(),
		{reason: `[[${this.discussion.getNomPageLink()}]] ${this.appConfig.script.advert}`}
	).then(
		() => redirectPage(pageResult),
		(_type, code, error) => {
			const titleLink = extraJs.makeLink(pageResult.page.getPrefixedText()).get(0).outerHTML;
			this.addError(
				`Could not delete page ${titleLink}`,
				{code, error}
			);
			this.trackStep({failed: true});
		});

	return $.when.apply(null,
		relevantPageResults.map(pageResult => this.deleteFirst
			? deleteAndRedirectPage(pageResult)
			: redirectPage(pageResult)
		)
	).then(() => {
		// All errors already handled above, just need to determine task status
		if (this.steps.completed === 0) {
			return "Failed";
		} else if (this.steps.completed < this.steps.total) {
			return "Done with errors";
		}
	});
};

export default RedirectTask;
// </nowiki>