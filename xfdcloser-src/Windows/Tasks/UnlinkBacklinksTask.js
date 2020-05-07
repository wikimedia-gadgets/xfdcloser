import Task from "../Components/Task";
import { multiButtonConfirm, recursiveMerge, rejection } from "../../util";
// <nowiki>

function UnlinkBacklinksTask(config) {
	config = {
		label: "Unlinking backlinks",
		...config
	};
	// Call parent constructor
	UnlinkBacklinksTask.super.call( this, config );

	this.summaryReason = typeof config.summaryReason === "undefined"
		? `[[${this.discussion.getNomPageLink()}]] closed as ${this.result}`
		: config.summaryReason;
	this.advert = this.appConfig.script.advert;

	this.finishedReadingApi = $.Deferred();
	this.queuedPrompts = [];
}
OO.inheritClass( UnlinkBacklinksTask, Task );

const flattenResults = list => list.flatMap(page => page.redirect
	? (page.redirlinks || []).map(subpage => subpage.title)
	: page.title
);
const redirectResults = list => list.filter(page => page.redirect).map(page => page.title);
const ignoreResultTitle = title => [
	"Template:WPUnited States Article alerts",
	"Template:Article alerts columns",
	"Template:Did you know nominations"
].includes(title.split("/")[0]);

/**
 * Queue a multiButtonConfirm prompt to be shown, after waiting for any other queued prompts to be resolved
 *   
 * @param {*} params Parameters for multiButtonConfirm
 * @returns {Promise<String>} action selected by user
 */
UnlinkBacklinksTask.prototype.queueMultiButtonConfirm = function(params) {
	const previousPrompt = this.queuedPrompts.length && this.queuedPrompts[this.queuedPrompts.length-1];
	const prompt = $.when(previousPrompt).then(() => {
		if (this.aborted) return rejection("Aborted");
		return multiButtonConfirm(params);
	});
	this.queuedPrompts.push(prompt);
	return prompt;
};

/**
 * Updates wikitext, removing/unlinking list items lines marked with {{subst:void}} after prompting user
 * @param {String} pageTitle
 * @param {String} wikitext
 * @param {Boolean} [isMajorEdit]
 * @returns {Promise} {String} updated wikitext, {Boolean} Edit should be considered major
 */
UnlinkBacklinksTask.prototype.processListItems = function(pageTitle, wikitext, isMajorEdit) {
	if (!this) {
		console.log("[XFDC][processListItems] `this` doesn't exist. Huh.");
		debugger; // eslint-disable-line
	}
	if (this.aborted) return rejection("Aborted");
	// Find lines marked with {{subst:void}}, and the preceding section heading (if any)
	var toReview = /^{{subst:void}}(.*)$/m.exec(wikitext);
	if ( !toReview ) {
		// None found, no changes needed
		return $.Deferred().resolve(wikitext, !!isMajorEdit).promise();
	}
	// Find the preceding heading, if any
	var precendingText = wikitext.split("{{subst:void}}")[0];
	var allHeadings = precendingText.match(/^=+.+?=+$/gm);
	var heading = ( !allHeadings ) ? null : allHeadings[allHeadings.length - 1]
		.replace(/(^=* *| *=*$)/g, "")
		.replace(/\[\[([^|\]]*?)\|([^\]]*?)\]\]/, "$2")
		.replace(/\[\[([^|\]]*?)\]\]/, "$1");

	// Prompt user
	const message = `<p>A backlink has been removed from the following list item:</p>
	<strong>List:</strong> [[${heading
		? `${pageTitle}#${mw.util.wikiUrlencode(heading)}|${pageTitle}#${heading}`
		: pageTitle
}]]
	<pre>${toReview[1]}</pre>
	<p>Please check if the item matches the list's [[WP:LISTCRITERIA|selection criteria]] before deciding to keep or remove the item from the list.</p>`;
	return this.queueMultiButtonConfirm({
		title: "Review unlinked list item",
		message,
		actions: [
			{ label:"Keep item", action:"keep", icon:"articleCheck", flags:"progressive" },
			{ label:"Keep and request citation", action:"keep-cite", icon:"flag" },
			{ label:"Remove item", action:"remove", icon:"trash", flags:"destructive"}
		],
		size: "large"
	})
		.then(action => {
			if ( action === "keep" ) {
			// Remove the void from the start of the line
				wikitext = wikitext.replace(/^{{subst:void}}/m, "");
			} else if ( action === "keep-cite" ) {
			// Remove the void from the start of the line, add citation needed at the end
				wikitext = wikitext.replace(/^{{subst:void}}(.*)(\n?)/m, "$1{{subst:Citation needed}}$2");
			} else {
			// Remove the whole line, mark as a major edit
				wikitext = wikitext.replace(/^{{subst:void}}.*\n?/m, "");
				isMajorEdit = true;
			}
			// Iterate, in case there is more to be reviewed
			return this.processListItems(pageTitle, wikitext, isMajorEdit);
		});
};

UnlinkBacklinksTask.prototype.doTask = function() {
	const onSuccess = () => { this.trackStep(); };
	const onFailure = (code, error, title) => {
		const titleLink = extraJs.makeLink(title).get(0).outerHTML; 
		switch(code) {
		case "skippedNoLinks":
			this.addWarning(`Skipped ${titleLink} (no direct links)`);
			this.trackStep();
			break;
		default:
			this.addError(
				`Could not edit page ${titleLink}`,
				{code, error}
			);
			this.trackStep({failed: true});
		}
	};
	const onReadFail = (errortype, code, error) => {
		if ( errortype === "read" ) {
			this.addError(
				"Could not read contents of pages; could not remove backlinks",
				{code, error}
			);
			return "Failed";
		} // other errors handled above
	};
	const transform = (page, redirectTitles) => {
		if (this.aborted) return rejection("Aborted");

		const oldWikitext = page.content;
		const newWikitext = extraJs.unlink(
			oldWikitext,
			[...this.pages.map(page => page.getPrefixedText()), ...redirectTitles],
			page.ns,
			!!page.categories
		);
		if (oldWikitext === newWikitext) {
			return rejection("skippedNoLinks");
		}
		return this.processListItems(page.title, newWikitext).then(
			(updatedWikitext, isMajorEdit) => {
				const isFfd = this.venue.type === "ffd";
				const thingsRemoved = `link(s)${isMajorEdit ? " / list item(s)" : ""}${isFfd ? " / file usage(s)" : ""}`;
				const req = {
					text: updatedWikitext,
					summary: `Removing ${thingsRemoved}: ${this.summaryReason} ${this.advert}`,
					nocreate: 1
				};
				if ( !isMajorEdit ) {
					req.minor = 1;
				}
				return req;
			}
		);
	};

	const iuParams = (this.venue.type === "ffd")
		? {
			list: "backlinks|imageusage",
			iufilterredir: "nonredirects",
			iulimit: "max",
			iunamespace: this.venue.ns_unlink,
			iuredirect: 1
		}
		: {};
	const baseParams = {
		list: "backlinks",
		blfilterredir: "nonredirects",
		bllimit: "max",
		blnamespace: this.venue.ns_unlink,
		blredirect: 1,
		...iuParams
	};

	return $.when.apply(null, this.pages.map(page => {
		const query = {
			...baseParams,
			bltitle: page.getPrefixedText()
		};
		if (this.venue.type === "ffd") {
			query.iutitle = page.getPrefixedText();
		}
		return this.api.queryWithContinue(query);
	})).then(function() {
		const results = Array.prototype.slice.call(arguments);
		return results.reduce(recursiveMerge);
	}).then(result => {
		this.finishedReadingApi.resolve();

		if (this.aborted) return rejection("Aborted");

		if (!result.imageusage) {
			result.imageusage = [];
		}
		if ( result.backlinks.length + result.imageusage.length === 0 ) {
			this.addWarning("none found");
			return "Skipped";
		}
		// Flatten arrays and extract titles
		const blTitles = extraJs.uniqueArray(flattenResults(result.backlinks)).filter(title => !ignoreResultTitle(title));
		const iuTitles = result.imageusage && extraJs.uniqueArray(flattenResults(result.imageusage)).filter(title => !ignoreResultTitle(title));
		const unlinkTitles = extraJs.uniqueArray([...blTitles, ...iuTitles]);
		const redirectTitles = redirectResults([...result.backlinks, ...result.imageusage]);

		// Ask user for confirmation
		const heading = `"Unlink backlinks${iuTitles.length ? " (and file usage)" : ""}:`;
		const message = `<p>All ${unlinkTitles.length} pages listed below may be edited (unless backlinks are only present due to transclusion of a template).</p>
<p>To process only some of these pages, use Twinkle's unlink tool instead.</p>
<p>Use with caution, after reviewing the pages listed below.
Note that the use of high speed, high volume editing software (such as this tool and Twinkle's unlink tool) is subject to the Bot policy's [[WP:ASSISTED|Assisted editing guidelines]]</p>
<hr>
<ul>${unlinkTitles.map(title => `<li>${title}</li>`).join("")}</ul>`;

		return multiButtonConfirm({
			title: heading,
			message: message,
			actions: [
				{ label: "Cancel", flags: "safe" },
				{ label: "Remove backlinks", action: "accept", flags: "progressive" }
			],
			size: "medium"
		}).then(action => {
			if (this.aborted) return rejection("Aborted");

			if (!action) {
				this.addWarning("Cancelled by user");
				return "Skipped";
			}
			this.setTotalSteps(unlinkTitles.length);
			const batchedTitles = unlinkTitles.reduce((batches, title) => {
				if (batches[batches.length-1].length === 50) {
					batches[batches.length] = [title];
				} else {
					batches[batches.length-1].push(title);
				}
				return batches;
			}, [[]]);

			const editPromises = batchedTitles.map(
				batch => this.api.editWithRetry(
					batch,
					{
						prop: "categories|revisions",
						clcategories: "Category:All disambiguation pages",
					},
					page => transform(page, redirectTitles),
					() => onSuccess(),
					(code, error, title) => onFailure(code, error, title)
				).catch(onReadFail)
			);

			return $.when.apply(null, editPromises);
		});
	});
};

export default UnlinkBacklinksTask;
// </nowiki>