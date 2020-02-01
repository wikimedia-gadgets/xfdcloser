// <nowiki>
/* ========== Venue class ====================================================================
   Each instance represents an XfD venue, with properties/function specific to that venue
   ---------------------------------------------------------------------------------------------- */
// Constructor
var Venue = function(type, settings) {
	this.type = type;
	for ( var key in settings ) {
		this[key] = settings[key];
	}
};
// ---------- Venue prototype  --------------------------------------------------------------- */
Venue.prototype.hasNomTemplate = function(wikitext) {
	var pattern = new RegExp(this.regex.nomTemplate);
	return pattern.test(wikitext);
};
Venue.prototype.removeNomTemplate = function(wikitext) {
	var pattern = new RegExp(this.regex.nomTemplate);
	var matches = wikitext.match(pattern);
	if ( !matches ) {
		return wikitext;
	}
	if ( matches.length > 1 ) {
		throw new Error("Multiple nomination templates on page");
	}
	return wikitext.replace(pattern, "");
};
Venue.prototype.updateNomTemplateAfterRelist = function(wikitext, today, sectionHeader) {
	var matches = wikitext.match(this.regex.relistPattern);
	if ( !matches ) {
		return wikitext;
	}
	if ( matches.length > 1 ) {
		throw new Error("Multiple nomination templates on page");
	}
	return wikitext.replace(
		this.regex.relistPattern,
		this.wikitext.relistReplace
			.replace("__TODAY__", today)
			.replace("__SECTION_HEADER__", sectionHeader)
	);
};
// ---------- Venue-specific instances  ----------------------------------------------------------- */
// MFD
Venue.Mfd = () => new Venue("mfd", {
	path:		 "Wikipedia:Miscellany for deletion",
	subpagePath: "Wikipedia:Miscellany for deletion/",
	ns_number:	 null,
	html: {
		head:			"h4",
		list:			"dl",
		listitem:		"dd"
	},
	wikitext: {
		closeTop:		"{{subst:Mfd top}} '''__RESULT__'''__TO_TARGET____RATIONALE__ __SIG__",
		closeBottom:	"{{subst:Mfd bottom}}",
		oldXfd:			"{{Old MfD |date=__DATE__ |result='''__RESULT__''' |page=__SUBPAGE__}}"+
            "\n",
		mergeFrom:		"{{mfd-mergefrom|__NOMINATED__|__DEBATE__|__DATE__}}\n",
		mergeTo:		"{{mfd-mergeto|__TARGET__|__DEBATE__|__DATE__|__TARGETTALK__}}\n",
		alreadyClosed:	"{{#ifeq:{{FULLPAGENAME}}|Wikipedia:Miscellany for deletion|"+
            "{{collapse bottom}}|}}"
	},
	regex: {
		nomTemplate:	/(?:<noinclude>\s*)?(?:{{mfd[^}}]*}}|<span id="mfd".*?<\/span>&nbsp;\[\[Category:Miscellaneous pages for deletion\|?.*\]\]\s*)(?:\s*<\/noinclude>)?/gi
	}
});

// CFD
Venue.Cfd = () => {
	let cfdVenue = new Venue("cfd", {
		path:		 "Wikipedia:Categories for discussion/Log/",
		ns_number:	 [14],
		html: {
			head:			"h4",
			list:			"ul",
			listitem:		"li",
			nthSpan:		"2"
		},
		wikitext: {
			closeTop:		"{{subst:cfd top}} '''__RESULT__'''__TO_TARGET____RATIONALE__ __SIG__",
			closeBottom:	"{{subst:cfd bottom}}",
			oldXfd:			"{{Old CfD |__SECTION__ |date=__DATE__ |action=__ACTION__ "+
				"|result=__RESULT__}}\n",
			alreadyClosed:	"<!-- Template:Cfd top -->",
			relistReplace:	" full|day=__DAY__|month=__MONTH__|year=__YEAR__",			
		},
		regex: {
			nomTemplate:	/<!--\s*BEGIN CFD TEMPLATE\s*-->(?:.|\n)+<!--\s*END CFD TEMPLATE\s*-->\n*/gi,
			relistPattern:	/ full\|day=\d\d?\|month=\w+\|year=\d{4}/gi
		}
	});
	// Override prototype
	cfdVenue.updateNomTemplateAfterRelist = function(wikitext, today, /*_sectionHeader*/) {
		var matches = wikitext.match(cfdVenue.regex.relistPattern);
		if ( !matches ) {
			return wikitext;
		}
		if ( matches.length > 1 ) {
			throw new Error("Multiple nomination templates on page");
		}
		var todayParts = today.split(" ");
		return wikitext.replace(
			cfdVenue.regex.relistPattern,
			cfdVenue.wikitext.relistReplace
				.replace("__DAY__", todayParts[2])
				.replace("__MONTH__", todayParts[1])
				.replace("__YEAR__", todayParts[0])
		)
			.replace( // {{cfc}} is a bit different to the other CFD nomination template
				/'''\[\[Wikipedia:Categories for discussion\/Log\/\d{4} \w+ \d{1,2}#/,
				"'''[[Wikipedia:Categories for discussion/Log/" + today + "#"
			);
	};
	return cfdVenue;
};

// FFD
Venue.Ffd = () => new Venue("ffd", {
	path:		 "Wikipedia:Files for discussion/",
	ns_number:	 [6],
	ns_unlink:   ["0", "10", "100", "118"], // main, Template, Portal, Draft
	html: {
		head:			"h4",
		list:			"dl",
		listitem:		"dd",
		nthSpan:		"1"
	},
	wikitext: {
		closeTop:		"{{subst:ffd top|'''__RESULT__'''}}__TO_TARGET____RATIONALE__ __SIG__",
		closeBottom:	"{{subst:ffd bottom}}",
		oldXfd:			"{{oldffdfull |date=__DATE__ |result='''__RESULT__''' "+
            "|page=__SECTION__}}\n",
		pagelinks:		"{{subst:ffd2|__PAGE__|multi=yes}}\n",
		relistReplace:	"{{ffd|log=__TODAY__",
		alreadyClosed:	"<!--Template:Ffd top-->"		
	},
	regex: {
		nomTemplate:	/{{ffd[^}}]*}}/gi,
		relistPattern:	/{{\s*ffd\s*\|\s*log\s*=\s*[^|}}]*/gi
	}
});

// TFD
Venue.Tfd = () => {
	let tfdVenue = new Venue("tfd", {
		path:		 "Wikipedia:Templates for discussion/Log/",
		subpagePath: "Wikipedia:Templates for discussion/",
		ns_number:	 [10, 828],
		html: {
			head:			"h4",
			list:			"ul",
			listitem:		"li",
			nthSpan:		"1"
		},
		wikitext: {
			closeTop:		"{{subst:Tfd top|'''__RESULT__'''}}__TO_TARGET____RATIONALE__ __SIG__",
			closeBottom:	"{{subst:Tfd bottom}}",
			oldXfd:			"{{oldtfdfull|date= __DATE__ |result=__RESULT__ |disc=__SECTION__}}\n",
			pagelinks:		"* {{tfd links|__PAGE__}}\n",
			relistReplace:	"Wikipedia:Templates for discussion/Log/__TODAY__#",
			alreadyClosed:	"<!-- Tfd top -->"
		},
		regex: {
			nomTemplate:	/(<noinclude>[\n\s]*)?{{(?:Template for discussion|Tfm)\/dated[^{}]*(?:{{[^}}]*}}[^}}]*)*?}}([\n\s]*<\/noinclude>)?(\n)?/gi,
			relistPattern:	/Wikipedia:Templates(_|\s){1}for(_|\s){1}discussion\/Log\/\d{4}(_|\s){1}\w*(_|\s){1}\d{1,2}#(?=[^}]*}{2})/gi
		},
		holdingCellSectionNumber: {
			"review":			2,
			"convert":			11,
			"substitute":		12,
			"orphan":			13,
			"ready":			14,	// (ready for deletion)
			"merge-arts":		4,
			"merge-geopolgov":	5,	// (geography, politics and governance)
			"merge-religion":	6,
			"merge-sports":		7,
			"merge-transport":	8,
			"merge-other":		9,
			"merge-meta":		10
		}
	});
	// Override prototype
	tfdVenue.removeNomTemplate = function(wikitext) {
		var pattern = new RegExp(tfdVenue.regex.nomTemplate);
		var matches = wikitext.match(pattern);
		if ( !matches ) {
			return wikitext;
		}
		if ( matches.length > 1 ) {
			throw new Error("Multiple nomination templates on page");
		}
		var tags = pattern.exec(wikitext);
		if ( !tags ) {
			return wikitext;
		}
		var logical_xor = function(first, second) {
			return (first ? true : false) !== (second ? true : false);
		};
		var unbalancedNoincludeTags = logical_xor(tags[1], tags[2]);
		var replacement = ( unbalancedNoincludeTags ) ? "$1$2" : "";
		return wikitext.replace(pattern, replacement);
	};
	tfdVenue.updateNomTemplateAfterRelist = function(wikitext, today, sectionHeader) {
		var matches = wikitext.match(tfdVenue.regex.relistPattern);
		if ( !matches ) {
			return wikitext;
		}
		if ( matches.length > 1 ) {
			throw new Error("Multiple nomination templates on page");
		}
		return wikitext.replace(
			tfdVenue.regex.relistPattern,
			tfdVenue.wikitext.relistReplace
				.replace("__TODAY__", today)
				.replace("__SECTION_HEADER__", sectionHeader)
		);
	};
	return tfdVenue;
};

// RFD
Venue.Rfd = () => {
	let rfdVenue = new Venue("rfd", {
		type:		 "rfd",
		path:		 "Wikipedia:Redirects for discussion/Log/",
		ns_number:	 null,
		html: {
			head:			"h4",
			list:			"ul",
			listitem:		"li"
		},
		wikitext: {
			closeTop:		"{{subst:Rfd top|'''__RESULT__'''}}__TO_TARGET____RATIONALE__ __SIG__",
			closeBottom:	"{{subst:Rfd bottom}}",
			oldXfd:			"{{Old RfD |date={{subst:date|__FIRSTDATE__}} |result='''__RESULT__'''"+
				" |page=__DATE__#__SECTION__}}\n",
			alreadyClosed:	"<!-- Template:Rfd top-->",
			relistReplace:	"#invoke:RfD||2=__SECTION_HEADER__|"
		},
		regex: {
			nomTemplate:		/(^\s*{{.*#invoke:RfD(?:.|\n)*?-->\|content=\n?|\n?<!-- Don't add anything after this line.*? -->\n}}|\[\[Category:Temporary maintenance holdings\]\]\n?)/g,
			fullNomTemplate:	/(^\s*{{.*#invoke:RfD(?:.|\n)*?<!-- Don't add anything after this line.*? -->\n}}|\[\[Category:Temporary maintenance holdings\]\]\n?)/g,
			relistPattern:  	/#invoke:RfD\|\|\|/gi
			
		},
	});
	// Override prototype
	rfdVenue.removeNomTemplate = function(wikitext) {
		var pattern = new RegExp(rfdVenue.regex.nomTemplate);
		return wikitext.replace(pattern, "");
	};
	return rfdVenue;
};

// AFD
Venue.Afd = transcludedOnly => new Venue("afd", {
	type:		 "afd",
	path:		 "Wikipedia:Articles for deletion/Log/",
	subpagePath: "Wikipedia:Articles for deletion/",
	ns_number:	 [0], // main
	ns_logpages: 4, // Wikipedia
	ns_unlink:   ["0", "10", "100", "118"], // main, Template, Portal, Draft
	html: {
		head:			"h3",
		list:			"dl",
		listitem:		"dd",
		nthSpan:		"2"
	},
	wikitext: {
		closeTop:		"{{subst:Afd top|'''__RESULT__'''}}__TO_TARGET____RATIONALE__ __SIG__",
		closeBottom:	"{{subst:Afd bottom}}",
		mergeFrom:		"{{Afd-merge from|__NOMINATED__|__DEBATE__|__DATE__}}\n",
		mergeTo:		"{{Afd-merge to|__TARGET__|__DEBATE__|__DATE__}}\n",
		alreadyClosed:	"<!--Template:Afd bottom-->"		
	},
	regex: {
		nomTemplate:	/(?:{{[Aa](?:rticle for deletion\/dated|fDM|fd\/dated)|<!-- Please do not remove or change this AfD message)(?:.|\n)*?}}(?:(?:.|\n)+this point -->)?\s*/g
	},
	transcludedOnly:	transcludedOnly
});

Venue.newFromPageName = function(pageName) {
	// Create xfd venue object for this page
	var isAfd = /(Articles_for_deletion|User:Cyberbot_I|Wikipedia:WikiProject_Deletion_sorting)/.test(pageName);
	var afdTranscludedOnly = /(User:Cyberbot_I|Wikipedia:WikiProject_Deletion_sorting)/.test(pageName);
	if ( pageName.includes("Wikipedia:Miscellany_for_deletion") ) {
		return Venue.Mfd();
	} else if ( pageName.includes("Categories_for_discussion/") ) {
		return Venue.Cfd();
	} else if ( pageName.includes("Files_for_discussion") ) {
		return Venue.Ffd();
	} else if ( pageName.includes("Templates_for_discussion") ) {
		return Venue.Tfd();
	} else if ( pageName.includes("Redirects_for_discussion") ) {
		return Venue.Rfd();
	} else if ( isAfd ) {
		return Venue.Afd(afdTranscludedOnly);
	} else {
		throw new Error("\"" + pageName + "\" is not an XFD page");
	}
};

export default Venue;
// </nowiki>