import { mw } from "../globals"; 
import Template from "./Template";

/**
 * Function to unlink and/or remove links and file usages from a block of wikitext.
 *
 * @param {string} wikitext Wikitext in which to search for links or file usages.
 * @param {string[]} unlinkThese Array of page titles to be unlinked.
 * @param {number} ns Number of the namespace which the wikitext is in.
 * @param {boolean} isDab Wikitext is of a disambiguation page.
 * @return {string} Updated wikitext. If no links or file usages were found, this will be
 *  the same as the input wikitext.
 */
export default function unlink(wikitext, unlinkThese, ns, isDab) {
	// Remove image/file usages, if any titles are files
	var unlinkFiles = unlinkThese.filter(function(t){ return /^File:/i.test(t); });
	if ( unlinkFiles.length > 0 ) {
		// Start building regex strings
		var normal_regex_str = "(";
		var gallery_regex_str = "(";
		var free_regex_str = "(";
		var filename, filename_regex_str;
		for ( var i=0; i<unlinkFiles.length; i++ ) {
			// Take off namespace prefix
			filename = unlinkFiles[i].replace(/^.*?:/, "");
			// For regex matching: first character can be either upper or lower case, special
			// characters need to be escaped, spaces/underscores can be either spaces or underscores
			filename_regex_str = "[" + mw.util.escapeRegExp(filename.slice(0, 1).toUpperCase()) +
			mw.util.escapeRegExp(filename.slice(0, 1).toLowerCase()) + "]" +
			mw.util.escapeRegExp(filename.slice(1)).replace(/(?: |_)/g, "[ _]");
			// Add to regex strings
			normal_regex_str += "\\[\\[\\s*(?:[Ii]mage|[Ff]ile)\\s*:\\s*" + filename_regex_str +
			"\\s*\\|?.*?(?:(?:\\[\\[.*?\\]\\]).*?)*\\]\\]";
			gallery_regex_str += "^\\s*(?:[Ii]mage|[Ff]ile):\\s*" + filename_regex_str + ".*?$";
			free_regex_str += "\\|\\s*(?:[\\w\\s]+\\=)?\\s*(?:(?:[Ii]mage|[Ff]ile):\\s*)?" +
			filename_regex_str;
			
			if ( i+1 !== unlinkFiles.length ) {
				normal_regex_str += "|";
				gallery_regex_str += "|";
				free_regex_str += "|";				
			}
		}
		// Close off regex strings
		normal_regex_str += ")(?![^<]*?-->)";
		gallery_regex_str += ")(?![^<]*?-->)";
		free_regex_str += ")(?![^<]*?-->)";

		// Check for normal file usage, i.e. [[File:Foobar.png|...]]
		var normal_regex = new RegExp( normal_regex_str, "g");
		wikitext = wikitext.replace(normal_regex, "");
		
		// Check for gallery usage, i.e. instances that must start on a new line, eventually
		// preceded with some space, and must include File: or Image: prefix
		var gallery_regex = new RegExp( gallery_regex_str, "mg" );
		wikitext = wikitext.replace(gallery_regex, "");
		
		// Check for free usages, for example as template argument, might have the File: or Image:
		// prefix excluded, but must be preceeded by an |
		var free_regex = new RegExp( free_regex_str, "mg" );
		wikitext = wikitext.replace(free_regex, "");
	}
	
	// Remove portal links/templates, if there are any	
	var unlinkPortals = unlinkThese.filter(function(t){ return /^Portal:/i.test(t); });
	if ( unlinkPortals.length > 0 ) {
		// Build regex string
		var portal_regex_str = "(" +
			unlinkPortals.map(function(portal) {
				// Take off namespace prefix
				var portalname = portal.replace("Portal:", "");
				// For regex matching: first character can be either upper or lower case, special
				// characters need to be escaped, spaces/underscores can be either spaces or underscores
				return "[" + mw.util.escapeRegExp(portalname.slice(0, 1).toUpperCase()) +
					mw.util.escapeRegExp(portalname.slice(0, 1).toLowerCase()) + "]" +
					mw.util.escapeRegExp(portalname.slice(1)).replace(/(?: |_)/g, "[ _]");
			}).join("|") +
			")(?![^<]*?-->)"; // Close off regex string
		var portal_regex = new RegExp(portal_regex_str);

		// Find templates to remove parameters from, or remove entirely
		var templatesInWikitext =  Template.parseTemplates(wikitext, true);
		
		// templates using numbered/unnamed parameters, e.g.{{Portal|Foo|Bar}}
		var numberedParameterTemplates = [
			// {{Portal}} and its redirects:
			"portal", "portalpar", "portal box", "ports", "portal-2",
			// {{Portal-inline}} and its redirects:
			"portal-inline", "portal inline", "portal frameless", "portal-inline-template",
			// {{Portal bar}} and its redirects:
			"portal bar", "portalbar"
		];
		// templates using named parameters, e.g. {{Subject bar |portal=Foo |portal2=Bar}}
		var namedParameterTemplates = ["subject bar"];
		
		// helper functions for filtering/mapping
		var isNumberedParameter = function(param) {
			return !isNaN(Number(param.name));
		};
		var isNamedPortalParameter = function(param) {
			return /portal\d*/.test(param.name);
		};

		/**
		 * @param {Template[]} existingTemplates Subset of Template objects from Template.parseTemplates
		 * @param {Function(ParamObject)=>boolean} paramTypeFilter Function that returns `true` if
		 *  the passed in parameter might contain a portal, and `false` otherwise
		 * @param {Function(ParamObject[])=>boolean} keepFilter Function that returns `true` if the
		 *  template should be kept (and edited), or `false` if the template should just be removed
		 * @sideEffect modifies variable `wikitext`
		 */
		var editOrRemoveTemplates = function( existingTemplates, paramTypeFilter, keepFilter ) {
			existingTemplates.forEach(function(template) {
				var paramsToKeep = template.parameters.filter(function(param) {
					return !paramTypeFilter(param) || !portal_regex.test(param.value);
				});
				if ( paramsToKeep.length === template.parameters.length ) {
					// No changes needed
					return;
				}				
				if ( keepFilter(paramsToKeep) ) {
					var updatedTemplateWikitext = template.wikitext.replace(/\|(.|\n)*/, "") +
						paramsToKeep.map(function(p) { return p.wikitext; }).join("") +
						"}}";
					wikitext = wikitext.replace(template.wikitext, updatedTemplateWikitext);
				} else {
					// Remove template wikitext, including any preceding * or : characters:
					// - if on it's own line, remove a linebreak
					wikitext = wikitext.replace(
						new RegExp("\\n[\\*\\:]*[\\t ]*" + mw.util.escapeRegExp(template.wikitext) + "\\n"),
						"\n"
					)
					// - if something else is on the line, leave the linebreaks alone
						.replace(
							new RegExp("[\\*\\:]*[\\t ]*" + mw.util.escapeRegExp(template.wikitext)),
							""
						);
				}
			});
		};

		// Deal with numbered-parameter templates
		editOrRemoveTemplates(
			templatesInWikitext.filter(function(template) {
				var name = template.name.toLowerCase().replace(/_/g, " ");
				return numberedParameterTemplates.includes(name);
			}),
			isNumberedParameter,
			function(params) { return params.some(isNumberedParameter); }
		);
		
		// Deal with named parameter templates
		editOrRemoveTemplates(
			templatesInWikitext.filter(function(template) {
				var name = template.name.toLowerCase().replace(/_/g, " ");
				return namedParameterTemplates.includes(name);
			}),
			isNamedPortalParameter,
			function(params) { return params.length > 0; }
		);
		
		// Remove any "See also" sections that are now empty
		var seeAlsoSection = /(==+)\s*[Ss]ee [Aa]lso\s*==+([.\n]*?)(?:(==+)|$)/g.exec(wikitext);
		if ( seeAlsoSection ) {
			var hasSubsection = seeAlsoSection[1] && seeAlsoSection[3] && seeAlsoSection[3].length > seeAlsoSection[1].length;
			var isEmpty = seeAlsoSection[2].trim() === "";
			if ( isEmpty && !hasSubsection ) {
				wikitext = wikitext.replace(seeAlsoSection[0], seeAlsoSection[3]);
			}
		}
	}
	
	// Remove links
	// Start building regex strings
	var simple_regex_str = "\\[\\[\\s*:?\\s*(";
	var named_regex_str = "\\[\\[\\s*:?\\s*(?:";
	for ( var ii=0; ii<unlinkThese.length; ii++ ) {
		// For regex matching: first character can be either upper or lower case, special
		// characters need to be escaped, spaces/underscores can be either spaces or underscores
		var unlink_regex_str = "[" + mw.util.escapeRegExp(unlinkThese[ii].slice(0, 1).toUpperCase()) +
			mw.util.escapeRegExp(unlinkThese[ii].slice(0, 1).toLowerCase()) + "]" +
			mw.util.escapeRegExp(unlinkThese[ii].slice(1)).replace(/(?: |_)/g, "[ _]");
		// Add to regex strings
		simple_regex_str += unlink_regex_str;
		named_regex_str += unlink_regex_str;
		if ( ii+1 !== unlinkThese.length ) {
			simple_regex_str += "|";
			named_regex_str += "|";			
		}
	}
	// Close off regex strings
	simple_regex_str += ")(?:#[^\\|\\]]*?)?\\s*\\]\\](?![^<]*?-->)";
	named_regex_str += ")(?:#[^\\|\\]]*?)?\\s*\\|([^\\[\\]\\n\\r]+?)\\]\\](?![^<]*?-->)";
	var simple_regex = new RegExp( simple_regex_str, "g" );
	var named_regex = new RegExp( named_regex_str, "g" );
	
	// Set index articles for names, which should be treated like disambiguation pages, will contain
	// one of these templates
	var name_set_index_regex = /\{\{\s*(?:[Gg]iven[ _]name|[Ss]urnames?|[Nn]ickname|[Ff]irst[ _]name|[Ff]orename|[Dd]isambigN(?:ame|m)?)\s*(?:\|.*?)*?\}\}/g;
	if ( name_set_index_regex.test(wikitext) ) {
		isDab = true;
	}
	
	// List items removals:
	if ( ns === 10 ) {
		//Within navbox templates, remove links entirely, including the preceding *'s and the following newline
		var navbox_regex = new RegExp("\\{\\{[Nn]avbox(?: with collapsible groups| with columns)?\\s*\\|" +
			"(?:.|\\n)*?(?:(?:\\{\\{" +			// accounts for templates within the navbox
				"(?:.|\\n)*?(?:(?:\\{\\{" +		// accounts for templates within templates within the navbox
					"(?:.|\\n)*?" +
				"\\}\\})(?:.|\\n)*?)*?" +
			"\\}\\})(?:.|\\n)*?)*" +
		"\\}\\}", "g");
		var navbox_simple_regex = new RegExp( "\\*+\\s*" + simple_regex_str + "[\\r\\t\\f\\v ]*\\n", "g" );
		var navbox_named_regex = new RegExp( "\\*+\\s*" + named_regex_str + "[\\r\\t\\f\\v ]*\\n", "g" );
		//Find navbox templates
		var navboxes = wikitext.match(navbox_regex);
		if ( navboxes ) {
			// remove regex matches from wikitext
			var replacement;
			for ( var jj=0; jj<navboxes.length; jj++ ) {
				replacement = navboxes[jj].replace(navbox_simple_regex, "").replace(navbox_named_regex, "");
				wikitext = wikitext.replace(navboxes[jj], replacement);
			}
		}
	} else if ( isDab ) {
		// For disambiguation pages, entirely remove list items containing a backlink, including the
		// preceding *'s and the following newline (but skiping list items with multiple links)
		var dab_simple_regex = new RegExp( "\\*+[^\\[\\]\\n\\r]*" + simple_regex_str + "[^\\[\\]\\n\\r]*\\n", "g" );
		var dab_named_regex = new RegExp( "\\*+[^\\[\\]\\n\\r]*" + named_regex_str + "[^\\[\\]\\n\\r]*\\n", "g" );	
		wikitext = wikitext.replace(dab_simple_regex, "").replace(dab_named_regex, "");
	} else {
		// For See also sections, entirely remove list items containing a backlink, including the
		// preceding *'s and the following newline (but skiping list items with multiple links)
		var seealso_regex = /==+\s*[Ss]ee [Aa]lso\s*==+\n+(?:^.*\n*)*?(?:(?===+)|$)/gm;
		var seealso_simple_regex = new RegExp( "\\*+[^\\[\\]\\n\\r]*" + simple_regex_str + "[^\\[\\]\\n\\r]*\\n", "g" );
		var seealso_named_regex = new RegExp( "\\*+[^\\[\\]\\n\\r]*" + named_regex_str + "[^\\[\\]\\n\\r]*\\n", "g" );
		var seealso = wikitext.match(seealso_regex);
		if ( seealso ) {
			// remove regex matches from wikitext
			var replacement_seealso;
			for ( var kk=0; kk<seealso.length; kk++ ) {
				replacement_seealso = (seealso[kk]+"\n").replace(seealso_simple_regex, "").replace(seealso_named_regex, "");
				wikitext = wikitext.replace(seealso[kk].trim(), replacement_seealso.trim());
			}
		}
		// Other lists need manual review, in case the item should be retained unlinked (e.g. complete lists per [[WP:CSC]])
	}
	// Mark any other list items with backlinks for manual review, using {{subst:void}}
	var manual_review_regex = new RegExp(
		"^(\\*+.*)(" +
		simple_regex_str.replace(/([^\\])\(([^?])/g, "$1(?:$2") + // replace capturing groups with non-capturing groups
		"|" +
		named_regex_str.replace(/([^\\])\(([^?])/g, "$1(?:$2") + // replace capturing groups with non-capturing groups
		")(.*)$", "gm" );
	wikitext = wikitext.replace(manual_review_regex, "{{subst:void}}$1{{subst:^|<strong>}}$2{{subst:^|</strong>}}$3");

	// For all other links, replace with unlinked text
	wikitext = wikitext.replace(simple_regex, "$1").replace(named_regex, "$1");

	return wikitext;
}
