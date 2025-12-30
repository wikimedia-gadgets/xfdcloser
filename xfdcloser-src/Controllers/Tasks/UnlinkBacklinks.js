import { $ } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { multiButtonConfirm, recursiveMerge, rejection, uniqueArray, multiCheckboxMessageDialog, isFile, cleanupVoidTemplates } from "../../util";
import unlink from "../../unlink";
// <nowiki>


export default class  UnlinkBacklinks extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName("Unlinking backlinks");
		this.finishedReadingApi = $.Deferred();
		this.queuedPrompts = [];
		this.redirectPageNames = [];
	}

	static flattenResults(list) {
		return list.flatMap(page => page.redirect
			? (page.redirlinks || []).map(subpage => subpage.title)
			: page.title
		);
	}
	/**
	 * 
	 * @param {Object[]} list backlink and imageusage objects from Api
	 * @returns {String[]} page names of redirects
	 */
	static findRedirectResults(list) {
		return list.filter(page => page.redirect).map(page => page.title);
	}
	static ignoreResultTitle(title) {
		return [
			"Template:WPUnited States Article alerts",
			"Template:Article alerts columns",
			"Template:Did you know nominations"
		].includes(title.split("/")[0]);
	}

	/**
	 * 
	 * @param {String} pageName
	 * @returns {Object<string,string|string[]|number>} Query parameters for backlinks and if applicable image usage
	 */
	getQuery(pageName) {
		const query = {
			list: "backlinks",
			blfilterredir: "nonredirects",
			bllimit: "max",
			blnamespace: this.model.venue.ns_unlink,
			blredirect: 1,
			bltitle: pageName
		};
		if ( isFile(pageName) ) {
			return {
				...query,
				list: "backlinks|imageusage",
				iufilterredir: "nonredirects",
				iulimit: "max",
				iunamespace: this.model.venue.ns_unlink,
				iuredirect: 1,
				iutitle: pageName
			};
		} else {
			return query;
		}
	}

	/**
	 * 
	 * @param {Object[]} backlinks backlinks objects from Api
	 * @param {Object[]} imageusage imageusage objects from Api
	 */
	getUnlinkPages(backlinks, imageusage) {
		const blPageNames = uniqueArray(UnlinkBacklinks.flattenResults(backlinks))
			.filter(title => !UnlinkBacklinks.ignoreResultTitle(title));
		const iuPageNames = uniqueArray(UnlinkBacklinks.flattenResults(imageusage))
			.filter(title => !UnlinkBacklinks.ignoreResultTitle(title));
		const unlinkPageNames = uniqueArray([...blPageNames, ...iuPageNames]);
		const redirectPageNames = UnlinkBacklinks.findRedirectResults([...backlinks, ...imageusage]);
		return {
			unlinkPageNames,
			redirectPageNames,
			hasImageUsage: iuPageNames.length > 0
		};
	}

	/**
	 * 
	 * @param {Object} selection Selection from multiCheckboxMessageDialog
	 *  @param {String} selection.action Action selected by user, "accept" or "reject"
	 *  @param {String[]} selection.item Page names selected by user
	 * @returns {Promise} Edits attempted or completed for each selected page name
	 */
	processSelection(selection) {
		if ( this.model.aborted ) {
			return rejection("aborted");
		} else if ( !selection || selection.action !== "accept" ) {
			this.model.addWarning("Cancelled by user");
			return;
		} else if ( !selection.items || selection.items.length === 0 ) {
			this.model.addWarning("No pages selected");
			return;
		}
		this.model.setTotalSteps( selection.items.length);
		const batchedPageNames = selection.items.reduce((batches, title) => {
			if (batches[batches.length-1].length === 50) {
				batches[batches.length] = [title];
			} else {
				batches[batches.length-1].push(title);
			}
			return batches;
		}, [[]]);

		const editPromises = batchedPageNames.map(
			batch => this.api.editWithRetry(
				batch,
				{
					prop: "categories|revisions",
					clcategories: "Category:All disambiguation pages",
				},
				page => this.transform(page),
				() => this.model.trackStep(),
				(code, error, title) => this.handlePageError(code, error, title)
			).catch(
				(errortype, code, error) => this.handleOverallError(errortype, code, error)
			)
		);

		return $.when.apply(null, editPromises);
	}
	
	/**
	 * 
	 * @param {Object} page Page object from Api
	 * @returns {Promise<Object<string,string|number>} Edit parameters
	 */
	transform(page) {
		if (this.model.aborted) return rejection("aborted");

		const newWikitext = unlink(
			page.content,
			[...this.model.getResolvedPageNames(), ...this.redirectPageNames],
			page.ns,
			!!page.categories
		);
		if ( newWikitext === page.content ) {
			return rejection("skippedNoLinks");
		}
		return this.processListItems(page.title, newWikitext)
			.then((updatedWikitext, isMajorEdit) => {
				const prefix = "Removing link(s)" +
					(isMajorEdit ? " / list item(s)" : "") +
					(isFile(page.title) ? " / file usage(s)" : "") + " because";
				const req = {
					text: cleanupVoidTemplates(updatedWikitext),
					summary: this.model.getEditSummary({prefix}),
					nocreate: 1
				};
				if ( !isMajorEdit ) {
					req.minor = 1;
				}
				return req;
			}
			);
	}

	/**
	 * Updates wikitext, removing/unlinking list items lines marked with {{subst:void}} after prompting user
	 * @param {String} pageTitle
	 * @param {String} wikitext
	 * @param {Boolean} [isMajorEdit]
	 * @returns {Promise} {String} updated wikitext, {Boolean} Edit should be considered major
	 */
	processListItems(pageTitle, wikitext, isMajorEdit) {
		if ( this.model.aborted ) return rejection("aborted");

		// Find lines needing review - those marked with {{subst:void}}
		var linesToReview = /^{{subst:void}}(.*)$/m.exec(wikitext);
		if ( !linesToReview ) {
			// None found, no changes needed
			return $.Deferred().resolve(wikitext, !!isMajorEdit).promise();
		}
		// Find the preceding heading, if any
		var precendingText = wikitext.split("{{subst:void}}")[0];
		var allHeadings = precendingText.match(/^=+.+?=+$/gm);
		var heading = !allHeadings
			? null
			: allHeadings[allHeadings.length - 1]
				.replace(/(^=* *| *=*$)/g, "")
				.replace(/\{\{.*?\}\}/g, "") // remove hidden templates, e.g. {{anchor}}
				.replace(/\[\[([^|\]]*?)\|([^\]]*?)\]\]/, "$2")
				.replace(/\[\[([^|\]]*?)\]\]/, "$1");

		// Prompt user
		const message = `<p>A backlink has been removed from the following list item:</p>
<strong>List:</strong> [[${heading ? pageTitle + "#" + heading : pageTitle}]]
<pre>${linesToReview[1]}</pre>
<p>Please check if the item matches the list's [[WP:LISTCRITERIA|selection criteria]] before deciding to keep or remove the item from the list.</p>`;
		return this.queueMultiButtonConfirm({
			title: "Review unlinked list item",
			message: message,
			actions: [
				{ label:"Keep item", action:"keep", icon:"articleCheck", flags:"progressive" },
				{ label:"Keep and request citation", action:"keep-cite", icon:"flag" },
				{ label:"Remove item", action:"remove", icon:"trash", flags:"destructive"}
			],
			size: "large",
			scrolled: true
		}).then(action => {
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
	}

	/**
	 * Queue a multiButtonConfirm prompt to be shown, after waiting for any other queued prompts to be resolved
	 *   
	 * @param {*} params Parameters for multiButtonConfirm
	 * @returns {Promise<String>} action selected by user
	 */
	queueMultiButtonConfirm(params) {
		const previousPrompt = this.queuedPrompts.length && this.queuedPrompts[this.queuedPrompts.length-1];
		const prompt = $.when(previousPrompt).then(() => {
			if ( this.aborted ) return rejection("aborted");

			return multiButtonConfirm(params);
		});
		this.queuedPrompts.push(prompt);
		return prompt;
	}

	doTask() {
		return $.when.apply(null,
			this.model.getResolvedPageNames().map(
				pageName => this.api.queryWithContinue(this.getQuery(pageName))
			)
		).then(function() {
			return Array.prototype.slice.call(arguments).reduce(recursiveMerge);
		}).then(result => {
			this.model.setDoing();
			if ( this.model.aborted ) {
				return rejection("aborted");
			}
			if ( !result.imageusage ) {
				result.imageusage = [];
			}
			if ( result.backlinks.length + result.imageusage.length === 0 ) {
				this.model.addWarning("none found");
				this.model.setTotalSteps(1);
				this.model.trackStep("skipped");
				return "Skipped";
			}
			const { unlinkPageNames, redirectPageNames, hasImageUsage } = this.getUnlinkPages(result.backlinks, result.imageusage);
			this.redirectPageNames = redirectPageNames;

			// Ask user for confirmation
			const title = `"Unlink backlinks${hasImageUsage ? " (and file usage)" : ""}:`;
			const messages = [
				"<p>All selected pages below may be edited (unless backlinks are only present due to transclusion of a template).</p>",
				`<p>Use with caution, after reviewing the ${unlinkPageNames.length === 1 ? "page" : unlinkPageNames.length + " pages"} listed below.</p>`,
				"<p>Note that the use of high speed, high volume editing software (such as this tool and Twinkle's unlink tool) is subject to the Bot policy's [[WP:ASSISTED|Assisted editing guidelines]]",
				"<hr>"
			];
			return multiCheckboxMessageDialog({
				title,
				message: $(...messages),
				items: unlinkPageNames.map(pageName => ({
					data: pageName,
					label: pageName,
					selected: true
				})),
				size: "medium",
				scrolled: true
			}).then(selection => this.processSelection(selection));
		});
	}
}
// </nowiki>
