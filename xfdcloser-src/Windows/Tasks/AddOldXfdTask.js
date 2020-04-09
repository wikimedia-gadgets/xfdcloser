import Task from "../Components/Task";
// <nowiki>

function AddOldXfdTask(config) {
	config = {
		label: `Updating talk ${config.pageResults.length > 1 ? "pages" : "page"}`,
		...config
	};
	// Call parent constructor
	AddOldXfdTask.super.call( this, config );
}
OO.inheritClass( AddOldXfdTask, Task );

/**
 * Make wikitext of old xfd template (non-AFD)
 * @param {String} [altpage]
 * @returns {String} wikitext for old xfd template
 */
const _makeOldxfdWikitext = function(altpage) {
	var result = this.venue.wikitext.oldXfd
		.replace(/__DATE__/, this.discussion.nomDate)
		.replace(/__SECTION__/, this.discussion.sectionHeader)
		.replace(/__RESULT__/, this.formData.resultWikitext)
		.replace(/__FIRSTDATE__/, this.discussion.firstDate)
		.replace(/__SUBPAGE__/, this.discussion.getNomSubpage());
	if ( altpage ) {
		result = result.replace("}}", ` |altpage=${altpage}}}`);
	}
	return result;
};

/**
 * Add or update oldafdmulti template in section wikitext
 * @param {String} wikitext
 * @param {String} pageTitle
 * @returns {String} updated section wikitext
 */
const _makeNewWikitext = function(wikitext, pageTitle) {
	const makeOldxfdWikitext = _makeOldxfdWikitext.bind(this);

	//Parts of this derived from https://en.wikipedia.org/wiki/User:Mr.Z-man/closeAFD2.js
	const titleObject = mw.Title.newFromText(pageTitle);
	const PAGENAME = titleObject.getMain();
	const SUBJECTPAGENAME = this.appConfig.monthNames[(titleObject.getNamespaceId()-1).toString()] +
		PAGENAME; 
	let oldafdmulti = "{{Old AfD multi";
	let count = 0;
	let oldAfdTemplate;

	const templates = extraJs.parseTemplates(wikitext, true);
	templates.forEach(template => {
		// Old AFDs
		if (/(?:old|afd) ?(?:old|afd) ?(?:multi|full)?/i.test(template.name)){
			oldAfdTemplate = template;
			template.parameters.forEach(param => {
				oldafdmulti += ` | ${param.name}=${param.value}`;
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
			const date = template.getParam("date") && template.getParam("date").value || "";
			const result = template.getParam("result") && template.getParam("result").value || "keep";
			const logSubpage = template.getParam("link") && template.getParam("link").value || `{{subst:Date|${date}|ymd}}`;
			const fragment = (template.getParam(1) && template.getParam(1).value) ||
				(template.getParam("disc") && template.getParam("disc").value) ||
				"Template:"+PAGENAME;
			const page = `{{subst:#ifexist:Wikipedia:Templates for deletion/Log/${logSubpage}`+
				`|Wikipedia:Templates for deletion/Log/${logSubpage}#${fragment}`+
				`|Wikipedia:Templates for discussion/Log/${logSubpage}#${fragment}}}`;
			oldafdmulti += ` |date${count}=${date} |result${count}='''${extraJs.toSentenceCase(result)}''' |page${count}=${page}`;
			wikitext = wikitext.replace(template.wikitext, "");
		}
		// Old FFDs
		else if (/old ?(?:f|i)fd(?:full)?/i.test(template.name)) {
			count++;
			const date = template.getParam("date") && template.getParam("date").value || "";
			const formattedDate = `{{subst:#iferror:{{subst:#time:|${date}}}|${date}|{{subst:#time:Y F j|${date}}}}}`;
			const result = template.getParam("result") && template.getParam("result").value || "keep";
			const fragment = "File:" + template.getParam("page") && template.getParam("page").value || PAGENAME;
			const page = `{{subst:#ifexist:Wikipedia:Images and media for deletion/${formattedDate}`+
				`|Wikipedia:Images and media for deletion/${formattedDate}#${fragment}`+
				`|{{subst:#ifexist:Wikipedia:Files for deletion/${formattedDate}`+
				`|Wikipedia:Files for deletion/${formattedDate}#${fragment}`+
				`|Wikipedia:Files for discussion/${formattedDate}#${fragment}`;
			oldafdmulti += ` |date${count}=${date} |result${count}='''${extraJs.toSentenceCase(result)}''' |page${count}=${page}`;
			wikitext = wikitext.replace(template.wikitext, "");
		}
		// Old MFDs
		else if (/(?:old ?mfd|mfdend|mfdold)(?:full)?/i.test(template.name)) {
			count++;
			const date = template.getParam("date") && template.getParam("date").value || "";
			const result = template.getParam("result") && template.getParam("result").value || "keep";
			const subpage = (template.getParam("votepage") && template.getParam("votepage").value) ||
				(template.getParam("title") && template.getParam("title").value) ||
				(template.getParam("page") && template.getParam("page").value) ||
				SUBJECTPAGENAME;
			const page = `Wikipedia:Miscellany for deletion/${subpage}`;
			oldafdmulti += ` |date${count}=${date} |result${count}='''${extraJs.toSentenceCase(result.replace(/'''/g, ""))}''' |page${count}=${page}`;
			wikitext = wikitext.replace(template.wikitext, "");	
		}
		// Old RFDs
		else if (/old?(?: |-)?rfd(?:full)?/i.test(template.name)) {
			count++;
			const date = template.getParam("date") && template.getParam("date").value || "";
			const result = template.getParam("result") && template.getParam("result").value || "keep";
			const rawlink = template.getParam("rawlink") && template.getParam("rawlink").value;
			const subpage = (template.getParam("page") && template.getParam("page").value) ||
				date + "#" + SUBJECTPAGENAME;
			const page = rawlink
				? rawlink.slice(2, rawlink.indexOf("|"))
				: "Wikipedia:Redirects for discussion/Log/" + subpage;
			oldafdmulti += ` |date${count}=${date} |result${count}='''${extraJs.toSentenceCase(result.replace(/'''/g, ""))}''' |page${count}=${page}`;
			wikitext = wikitext.replace(template.wikitext, "");
		}
	});

	// For non-AFDs, if no old banners were found, prepend process-specific banner to content
	if ( this.venue.type !== "afd" && count === 0 ) {
		return makeOldxfdWikitext() + wikitext;
	}
	
	// Otherwise, add current discussion to oldafdmulti
	count++;
	const currentCount = count === 1 ? "" : count.toString();
	const currentResult = count === 1
		? this.formData.resultWikitext
		: extraJs.toSentenceCase(this.formData.resultWikitext);

	const page = this.venue.type === "afd"
		? this.discussion.getNomSubpage()
		: this.discussion.getNomPageLink();
		
	oldafdmulti += ` |date${currentCount}=${this.discussion.nomDate} |result${currentCount}='''${currentResult}''' |page${currentCount}=${page}}}`;

	if ( oldAfdTemplate ) {
		// Override the existing oldafdmulti
		return wikitext.replace(oldAfdTemplate.wikitext, oldafdmulti+"\n");
	} else {
		// Prepend to content ([[WP:Talk page layout]] is too complicated to automate)
		return oldafdmulti + "\n" + wikitext;
	}
};

/**
 * Function to transform a (simplified) API page object into edit parameters.
 * @param {Object} page simplified API page object
 * @returns {Object} API edit parameters
 */
const _transform = function(page) {
	const makeOldxfdWikitext = _makeOldxfdWikitext.bind(this);
	const makeNewWikitext = _makeNewWikitext.bind(this);

	// Check there's a corresponding nominated page
	const pageObj = this.discussion.getPageByTalkTitle(page.title);
	if ( !pageObj ) {
		return $.Deferred().reject("Unexpected title");
	}
	// Check corresponding page exists
	if ( !pageObj.exists() ) {
		return $.Deferred().reject("Subject page does not exist");
	}
	const baseEditParams = {
		section: "0",
		summary: `Old ${this.venue.type.toUpperCase()} – ${this.discussion.nomDate}: ${this.formData.resultWikitext} ${this.appConfig.script.advert}`,
	};
	
	// Required edit params vary based on talk page redirect status and venue
	switch(true) {
	case page.redirect && this.venue.type === "rfd":
		// Redirect at RfD: ssk what to to do
		return OO.ui.confirm(`"${page.title}" is currently a redirect. Okay to replace with Old RFD template?`)
			.then( confirmed => {
				if (!confirmed) {
					return $.Deferred().reject("skipped");
				}
				return {
					...baseEditParams,
					text: makeOldxfdWikitext(),
					redirect: false
				};
			} );
	case page.redirect && this.venue.type === "mfd":
		// Redirect at MfD: edit the redirect's target page, using the altpage parameter
		return {
			...baseEditParams,
			prependtext: makeOldxfdWikitext(pageObj.getPrefixedText()),
			redirect: true
		};
	case page.redirect && this.venue.type !== "afd":
		// Redirect at other venues, except afd: append rather than prepend old xfd template
		return {
			...baseEditParams,
			appendtext: "\n" + makeOldxfdWikitext(),
			redirect: false
		};
	default:
		// Attempt to find and consolidate existing banners
		return {
			...baseEditParams,
			text: makeNewWikitext(
				page.missing ? "" : page.content,
				page.title),
			redirect: false,	
		};
	}
};

AddOldXfdTask.prototype.doTask = function() {
	const talkTitles = this.discussion.getTalkTitles(this.pages);
	if ( talkTitles.length === 0 ) {
		this.addWarning("None found");
		return $.Deferred().resolve();
	}
	this.setTotalSteps(talkTitles.length);
	const transform = _transform.bind(this);
	return this.api.editWithRetry(
		talkTitles,
		{rvsection: "0"},
		page => transform(page),
		() => this.trackStep(),
		(code, error, title) => {
			const titleLink = extraJs.makeLink(title).get(0).outerHTML;
			switch(code) {
			case "Unexpected title":
				this.addError(
					`API query result included unexpected talk page title ${titleLink}; this talk page will not be edited`
				);
				this.trackStep({failed: true});
				break;
			case "Subject page does not exist":
				this.addError(
					`The subject page for ${titleLink} does not exist; this talk page will not be edited`
				);
				this.trackStep({failed: true});
				break;
			case "skipped":
				this.addWarning(`${titleLink} skipped`);
				this.trackStep();
				break;
			default:
				this.addError(
					`Could not edit talk page ${titleLink}`,
					{code, error}
				);
				this.trackStep({failed: true});
			}
		}
	).catch( (errortype, code, error) => {
		if ( errortype === "read" ) {
			this.addError(code, error, 
				`Could not read contents of talk ${talkTitles.length > 1 ? "pages" : "page"}`
			);
			return "Failed";
		}
		// Other errors already handled above, just need to determine task status
		return (this.steps.completed === 0) ? "Failed" : "Done with errors";
	} );
};

export default AddOldXfdTask;
// </nowiki>