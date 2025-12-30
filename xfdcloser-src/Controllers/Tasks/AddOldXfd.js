import { $, mw, OO } from "../../../globals";
import TaskItemController from "../TaskItemController";
import { rejection, dmyDateString, dateFromUserInput, uppercaseFirst, ymdDateString } from "../../util";
import Template from "../../Template";
// <nowiki>

export default class AddOldXfdTask extends TaskItemController {
	constructor(model, widgets) {
		super(model, widgets);
		this.model.setName(`Updating talk ${model.pageNames.length > 1 ? "pages" : "page"}`);
	}

	/**
	 * Make wikitext of old xfd template (non-AFD)
	 * @param {String} [altpage]
	 * @returns {String} wikitext for old xfd template
	 */
	makeOldxfdWikitext(altpage) {
		var result = this.model.venue.wikitext.oldXfd
			.replace(/__DATE__/, dmyDateString(this.model.discussion.nominationDate))
			.replace(/__DATE_YMD__/, ymdDateString(this.model.discussion.nominationDate))
			.replace(/__ACTION__/, this.model.discussion.action)
			.replace(/__SECTION__/, this.model.discussion.sectionHeader)
			.replace(/__RESULT__/, this.model.result.getResultText())
			.replace(/__FIRSTDATE__/, dmyDateString(this.model.discussion.firstCommentDate))
			.replace(/__SUBPAGE__/, this.model.discussion.discussionSubpageName);
		if ( altpage ) {
			result = result.replace("}}", ` |altpage=${altpage}}}`);
		}
		return result;
	}

	/**
	 * Add or update oldafdmulti template in section wikitext
	 * @param {String} wikitext
	 * @param {String} pageTitle
	 * @returns {String} updated section wikitext
	 */
	makeNewWikitext(wikitext, pageTitle) {
		//Parts of this derived from https://en.wikipedia.org/wiki/User:Mr.Z-man/closeAFD2.js
		const titleObject = mw.Title.newFromText(pageTitle);
		const PAGENAME = titleObject.getMain();
		const SUBJECTPAGENAME = titleObject.getSubjectPage().getNamespacePrefix() +	PAGENAME; 
		let oldafdmulti = "{{Old AfD multi";
		let count = 0;
		let oldAfdTemplate;

		const templates = Template.parseTemplates(wikitext, true);
		templates.forEach(template => {
			const isXfdTemplate = /(a|t|d|f|i|m|r)fd/i.test(template.name);
			if ( !isXfdTemplate ) return;
			const dateParamValue = template.getParamValue("date") || "";
			const date = dateFromUserInput(dateParamValue);
			const ymdFormatDate = date && ymdDateString(date) || dateParamValue;
			const dmyFormatDate = date && dmyDateString(date) || dateParamValue;
			const result = template.getParamValue("result") || "keep";

			// Old AFDs
			if (/(?:old|afd) ?(?:old|afd) ?(?:multi|full)?/i.test(template.name)){
				oldAfdTemplate = template;
				template.parameters.forEach(param => {
					oldafdmulti += ` |${param.name}=${param.value}`;
					const numCheck = /[A-z]+([0-9]+)/i.exec(param.name);
					const paramNum = numCheck && parseInt(numCheck[1]) || 1;
					if (paramNum > count) {
						count = paramNum;
					}
				});
			}
			// Old TFDs
			else if (/(?:old|tfd|Previous) ?(?:tfd|tfd|end)(?:full)?/i.test(template.name)) {
				count++;
				const logSubpage = template.getParamValue("link") || ymdFormatDate;
				const fragment = template.getParamValue(1) || template.getParamValue("disc") || "Template:"+PAGENAME;
				const page = `{{subst:#ifexist:Wikipedia:Templates for deletion/Log/${logSubpage}`+
					`|Wikipedia:Templates for deletion/Log/${logSubpage}#${fragment}`+
					`|Wikipedia:Templates for discussion/Log/${logSubpage}#${fragment}}}`;
				oldafdmulti += ` |date${count}=${dmyFormatDate} |result${count}='''${uppercaseFirst(result.replace(/'''/g, ""))}''' |page${count}=${page}`;
				wikitext = wikitext.replace(template.wikitext+"\n", "").replace(template.wikitext, "");
			}
			// Old FFDs
			else if (/old ?(?:f|i)fd(?:full)?/i.test(template.name)) {
				count++;
				const fragment = "File:" + template.getParamValue("page") || PAGENAME;
				const page = `{{subst:#ifexist:Wikipedia:Images and media for deletion/${ymdFormatDate}`+
					`|Wikipedia:Images and media for deletion/${ymdFormatDate}#${fragment}`+
					`|{{subst:#ifexist:Wikipedia:Files for deletion/${ymdFormatDate}`+
					`|Wikipedia:Files for deletion/${ymdFormatDate}#${fragment}`+
					`|Wikipedia:Files for discussion/${ymdFormatDate}#${fragment}}}}}`;
				oldafdmulti += ` |date${count}=${dmyFormatDate} |result${count}='''${uppercaseFirst(result.replace(/'''/g, ""))}''' |page${count}=${page}`;
				wikitext = wikitext.replace(template.wikitext+"\n", "").replace(template.wikitext, "");
			}
			// Old MFDs
			else if (/(?:old ?mfd|mfdend|mfdold)(?:full)?/i.test(template.name)) {
				count++;
				const subpage = template.getParamValue("votepage") ||
					template.getParamValue("title") ||
					template.getParamValue("page") ||
					SUBJECTPAGENAME;
				const page = `Wikipedia:Miscellany for deletion/${subpage}`;
				oldafdmulti += ` |date${count}=${dmyFormatDate} |result${count}='''${uppercaseFirst(result.replace(/'''/g, ""))}''' |page${count}=${page}`;
				wikitext = wikitext.replace(template.wikitext+"\n", "").replace(template.wikitext, "");
			}
			// Old RFDs
			else if (/old?(?: |-)?rfd(?:full)?/i.test(template.name)) {
				count++;
				const rawlink = template.getParamValue("rawlink");
				const subpage = template.getParamValue("page") || ymdFormatDate + "#" + SUBJECTPAGENAME;
				const page = rawlink
					? rawlink.slice(2, rawlink.indexOf("|"))
					: "Wikipedia:Redirects for discussion/Log/" + subpage;
				oldafdmulti += ` |date${count}=${dmyFormatDate} |result${count}='''${uppercaseFirst(result.replace(/'''/g, ""))}''' |page${count}=${page}`;
				wikitext = wikitext.replace(template.wikitext+"\n", "").replace(template.wikitext, "");
			}
		});

		// For non-AFDs, if no old banners were found, prepend process-specific banner to content
		if ( this.model.venue.type !== "afd" && count === 0 ) {
			return this.makeOldxfdWikitext() + wikitext;
		}
		
		// Otherwise, add current discussion to oldafdmulti
		count++;
		const currentCount = count === 1 ? "" : count.toString();
		const currentResult = count === 1
			? this.model.result.getResultText()
			: uppercaseFirst(this.model.result.getResultText());

		const page = this.model.venue.type === "afd"
			? this.model.discussion.discussionSubpageName
			: this.model.discussion.discussionPageLink;
			
		oldafdmulti += ` |date${currentCount}=${dmyDateString(this.model.discussion.nominationDate)} |result${currentCount}='''${currentResult}''' |page${currentCount}=${page}}}`;

		if ( oldAfdTemplate ) {
			// Override the existing oldafdmulti
			return wikitext.replace(oldAfdTemplate.wikitext, oldafdmulti);
		} else {
			// Prepend to content ([[WP:Talk page layout]] is too complicated to automate)
			return oldafdmulti + "\n" + wikitext.trim();
		}
	}

	/**
	 * Function to transform an API page object into edit parameters.
	 * @param {Object} page simplified API page object
	 * @returns {Object} API edit parameters
	 */
	transform(page) {
		if ( this.model.aborted ) return rejection("aborted");

		// Check there's a corresponding nominated page, and that page exists
		const pageName = this.model.getResolvedTalkpagesNames().find(talkpageName => talkpageName === page.title);
		const pageTitle = pageName && mw.Title.newFromText(pageName);
		if ( !pageTitle ) {
			return rejection("unexpectedTitle");
		} else if ( !pageTitle.getSubjectPage().exists() ) {
			return rejection("Subject page does not exist");
		}
		const baseEditParams = {
			section: "0",
			summary: this.model.getEditSummary({prefix: `Old ${this.model.venue.type.toUpperCase()}:`})
		};
		
		// Required edit params vary based on talk page redirect status and venue
		switch(true) {
		case page.redirect && this.model.venue.type === "rfd":
			// Redirect at RfD: ask what to to do
			return OO.ui.confirm(`"${page.title}" is currently a redirect. Okay to replace with Old RFD template?`)
				.then( confirmed => {
					if (!confirmed) {
						return $.Deferred().reject("skipped");
					}
					return {
						...baseEditParams,
						text: this.makeOldxfdWikitext(),
						redirect: false
					};
				} );
		case page.redirect && this.model.venue.type === "mfd":
			// Redirect at MfD: edit the redirect's target page, using the altpage parameter
			return {
				...baseEditParams,
				prependtext: this.makeOldxfdWikitext(pageTitle.getPrefixedText()),
				redirect: true
			};
		case page.redirect && this.model.venue.type !== "afd":
			// Redirect at other venues, except afd: append rather than prepend old xfd template
			return {
				...baseEditParams,
				appendtext: "\n" + this.makeOldxfdWikitext(),
				redirect: false
			};
		default:
			// Attempt to find and consolidate existing banners
			return {
				...baseEditParams,
				text: this.makeNewWikitext(page.missing ? "" : page.content, page.title),
				redirect: false,
			};
		}
	}

	doTask() {
		const talkpagesNames = this.model.getResolvedTalkpagesNames();
		if ( talkpagesNames.length === 0 ) {
			this.model.addWarning("None found");
			return rejection();
		}
		this.model.setTotalSteps(talkpagesNames.length);
		this.model.setDoing();
		return this.api.editWithRetry(
			talkpagesNames,
			{
				rvsection: "0",
			},
			page => this.transform(page),
			() => this.model.trackStep(),
			(code, error, title) => this.handlePageError(code, error, title)
		).catch(
			(errortype, code, error) => this.handleOverallError(errortype, code, error)
		);
	}
}
// </nowiki>
