import { mw } from "../globals";
import { mostFrequent } from "./util";
/**
 * @private
 * @class
 * @prop {String|Number} name parameter name, or position for unnamed parameters
 * @prop {String} value wikitext passed into the parameter (whitespace trimmed)
 * @prop {String} wikitext Full wikitext, including leading pipe, parameter name/equals sign (if applicable), value, and any whitespace
 */
class Parameter {
	/**
	 * @param {String|Number} name parameter name, or position for unnamed parameters
	 * @param {String} value wikitext passed into the parameter (whitespace trimmed)
	 * @param {String} wikitext Full wikitext, including leading pipe, parameter name/equals sign (if applicable), value, and any whitespace
	 */
	constructor(name, value, wikitext) {
		this.name = name;
		this.value = value;
		this.wikitext = wikitext;
	}
	/**
	 * @prop {Boolean} isNumberedParam parameter is either unnamed (positional), or named with a number
	 */
	get isNumberedParam() {
		return typeof this.name === "number" || /^[0-9]+$/.test(this.name);
	}
	/**
	 * @prop {Number|NaN} number parameter number for numbered parameters, otherwise NaN 
	 */
	get number() {
		return this.isNumberedParam ? Number(this.name) : NaN;
	}
	/**
	 * 
	 * @param {String} wikitext parameter chunk wikitext - excluding leading or trailing pipes or braces, but including whitespace
	 * @param {Parameter[]} otherParameters other parameters in the template, in order to determine an unnamed parameter's position number
	 * @returns {Parameter}
	 */
	static newFromWikitext(wikitext, otherParameters) {
		var indexOfEqualTo = wikitext.indexOf("=");
		var indexOfOpenBraces = wikitext.indexOf("{{");
		
		var isWithoutEquals = !wikitext.includes("=");
		var hasBracesBeforeEquals = wikitext.includes("{{") && indexOfOpenBraces < indexOfEqualTo;	
		var isUnnamedParam = ( isWithoutEquals || hasBracesBeforeEquals );
		
		if ( isUnnamedParam ) {
			// Get the next number not already used by either an unnamed parameter, or by a
			// named parameter like `|1=val`. These may be out of order, e.g. {{foo|3=qux|bar}}
			const numbers = otherParameters.map(param => param.number);
			let nextNumber = 1;
			while (numbers.includes(nextNumber)) {
				nextNumber++;
			}
			return new Parameter(nextNumber, wikitext.trim(), "|"+wikitext);
		} else {
			return new Parameter(
				wikitext.slice(0, indexOfEqualTo).trim(),
				wikitext.slice(indexOfEqualTo + 1).trim(),
				"|"+wikitext
			);
		}
	}
}

/** Template
 *
 * @class
 * Represents the wikitext of template transclusion. Used by #parseTemplates.
 * @prop {String} name Name of the template
 * @prop {String} wikitext Full wikitext of the transclusion
 * @prop {Parameter[]} parameters Parameters used in the translcusion, in order
 */
export default class Template {
	/**
	 * @constructor
	 * @param {String} wikitext Wikitext of a template transclusion, starting with "{{" and ending with "}}".
	 */
	constructor(wikitext) {
		this.wikitext = wikitext;
		this.parameters = [];
		// Spacing around pipes, equals signs, end braces (defaults)
		this.pipeStyle = " |";
		this.equalsStyle = "=";
		this.endBracesStyle = "}}";
	}
	addParam(parameter) {
		this.parameters.push(parameter);
	}
	/**
     * Get a parameter data by parameter name
	 * @param {String|Number} paramName parameter name, or position number of an unnamed parameter
	 * @returns {Parameter|null} paraeter object, or null if parameter was not found
     */
	getParam(paramName) {
		return this.parameters.find(function (p) { return p.name == paramName; });
	}
	/**
	 * Get a parameter's value by parameter name
	 * @param {String|Number} paramName parameter name, or position number of an unnamed parameter
	 * @returns {String|null} paraeter value, or null if parameter was not found
	 */
	getParamValue(paramName) {
		const param = this.getParam(paramName);
		return param && param.value;
	}
	setName(name) {
		this.name = name.trim();
	}
	getTitle() {
		return mw.Title.newFromText("Template:" + this.name);
	}

	/**
	 * parseTemplates
	 *
	 * Parses templates from wikitext.
	 * Based on SD0001's version at <https://en.wikipedia.org/wiki/User:SD0001/parseAllTemplates.js>.
	 * Returns an array containing the template details:
	 *  var templates = parseTemplates("Hello {{foo |Bar|baz=qux |2=loremipsum|3=}} world");
	 *  console.log(templates[0]); // --> object
		{
			name: "foo",
			wikitext:"{{foo |Bar|baz=qux | 2 = loremipsum  |3=}}",
			parameters: [
				{
					name: 1,
					value: 'Bar',
					wikitext: '|Bar'
				},
				{
					name: 'baz',
					value: 'qux',
					wikitext: '|baz=qux '
				},
				{
					name: '2',
					value: 'loremipsum',
					wikitext: '| 2 = loremipsum  '
				},
				{
					name: '3',
					value: '',
					wikitext: '|3='
				}
			]
		}
	* 
	* @param {String} wikitext
	* @param {Boolean} recursive Set to `true` to also parse templates that occur within other templates,
	*  rather than just top-level templates. 
	* @return {Template[]} templates
	*/
	static parseTemplates = function(wikitext, recursive) { /* eslint-disable no-control-regex */
		if ( !wikitext ) {
			return [];
		}
		const strReplaceAt = function(string, index, char) {
			return string.slice(0,index) + char + string.slice(index + 1);
		};

		const result = [];
		
		const processTemplateText = function(startIdx, endIdx) {
			let text = wikitext.slice(startIdx, endIdx);

			const template = new Template("{{" + text.replace(/\x01/g,"|") + "}}");
			
			// swap out pipe in links with \x01 control character
			// [[File: ]] can have multiple pipes, so might need multiple passes
			while ( /(\[\[[^\]]*?)\|(.*?\]\])/g.test(text) ) {
				text = text.replace(/(\[\[[^\]]*?)\|(.*?\]\])/g, "$1\x01$2");
			}

			// Figure out most-used spacing styles for pipes/equals
			template.pipeStyle = mostFrequent( text.match(/[\s\n]*\|[\s\n]*/g) ) || " |";
			template.equalsStyle = mostFrequent( text.replace(/(=[^|]*)=+/g, "$1").match(/[\s\n]*=[\s\n]*/g) ) || "=";
			// Figure out end-braces style
			const endSpacing = text.match(/[\s\n]*$/);
			template.endBracesStyle = (endSpacing ? endSpacing[0] : "") + "}}";

			const [name, ...parameterChunks] = text.split("|").map(function(chunk) {
				// change '\x01' control characters back to pipes
				return chunk.replace(/\x01/g,"|"); 
			});

			template.setName(name);
			parameterChunks.forEach(chunk => {
				template.addParam(
					Parameter.newFromWikitext(chunk, Template.parameters)
				);
			});
			
			result.push(template);
		};

		
		var n = wikitext.length;
		
		// number of unclosed braces
		var numUnclosed = 0;

		// are we inside a comment, or between nowiki tags, or in a {{{parameter}}}?
		var inComment = false;
		var inNowiki = false;
		var inParameter = false;

		var startIdx, endIdx;
		
		for (var i=0; i<n; i++) {
			
			if ( !inComment && !inNowiki && !inParameter ) {

				if (wikitext[i] === "{" && wikitext[i+1] === "{" && wikitext[i+2] === "{" && wikitext[i+3] !== "{") {
					inParameter = true;
					i += 2;
				} else if (wikitext[i] === "{" && wikitext[i+1] === "{") {
					if (numUnclosed === 0) {
						startIdx = i+2;
					}
					numUnclosed += 2;
					i++;
				} else if (wikitext[i] === "}" && wikitext[i+1] === "}") {
					if (numUnclosed === 2) {
						endIdx = i;
						processTemplateText(startIdx, endIdx);
					}
					numUnclosed -= 2;
					i++;
				} else if (wikitext[i] === "|" && numUnclosed > 2) {
					// swap out pipes in nested templates with \x01 character
					wikitext = strReplaceAt(wikitext, i,"\x01");
				} else if ( /^<!--/.test(wikitext.slice(i, i + 4)) ) {
					inComment = true;
					i += 3;
				} else if ( /^<nowiki ?>/.test(wikitext.slice(i, i + 9)) ) {
					inNowiki = true;
					i += 7;
				} 

			} else { // we are in a comment or nowiki or {{{parameter}}}
				if (wikitext[i] === "|") {
					// swap out pipes with \x01 character
					wikitext = strReplaceAt(wikitext, i,"\x01");
				} else if (/^-->/.test(wikitext.slice(i, i + 3))) {
					inComment = false;
					i += 2;
				} else if (/^<\/nowiki ?>/.test(wikitext.slice(i, i + 10))) {
					inNowiki = false;
					i += 8;
				} else if (wikitext[i] === "}" && wikitext[i+1] === "}" && wikitext[i+2] === "}") {
					inParameter = false;
					i += 2;
				}
			}

		}
		
		if ( recursive ) {
			var subtemplates = result
				.filter(template => /\{\{(?:.|\n)*\}\}/.test(template.wikitext.slice(2,-2)))
				.map(template => Template.parseTemplates(template.wikitext.slice(2,-2), true));
			return result.concat.apply(result, subtemplates);
		}

		return result; 
	}; /* eslint-enable no-control-regex */
}