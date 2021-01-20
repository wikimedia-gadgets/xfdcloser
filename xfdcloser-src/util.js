import { $, mw, OO } from "../globals";
import ScrolledMessageDialog from "./Components/ScrolledMessageDialog";
import Month from "./Month";
// <nowiki>

/**
 * Escape html tag characters, replacing with ampersand-encoded versions
 * @param {String} string
 * @returns {String} escaped string 
 */
const escapeHtml = function(string) {
	return string.replace(/['"<>&]/g, function (char) {
		switch (char) {
		case "'":
			return "&#039;";
		case "\"":
			return "&quot;";
		case "<":
			return "&lt;";
		case ">":
			return "&gt;";
		case "&":
			return "&amp;";
		}
	});
};

/**
 * Percent-encodes characters which are not safe for urls
 * @param {string} text
 * @returns {string} url-encoded text
 */
const encodeForUrl = function(text) {
	return encodeURIComponent(String(text)) // Percent-encode everything except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
		.replace(/'/g, "%27") // Percent-encode the ' character
		.replace(/%20/g, "_") // Replace percent-encoded spaces with underscores
		// Decode certain characters which are safe to use
		.replace(/%3B/g, ";").replace(/%40/g, "@").replace(/%24/g, "$").replace(/%2C/g, ",").replace(/%2F/g, "/").replace(/%3A/g, ":");
};

/**
 * Makes a link to a wiki page - as a string, with approporiate escaping and encoding
 * @param {string} target Target page name
 * @param {string} [text] Displayed text for link, if different to the target page name
 * @returns {string} Outer html of link
 */
const makeLink = function(target, text) {
	if ( !text ) {
		text = target;
	}
	const url = "/wiki/" + encodeForUrl(target);
	return `<a href="${url}" target="_blank">${escapeHtml(text.trim())}</a>`;
};

/**
 * Encodes text to be used as a fragment in a wikilink.
 * Same as #encodeForUrl above, but with underscored replaced by spaces.
 * @param {*} text
 */
const encodeForWikilinkFragment = function(text) {
	return encodeForUrl(text).replace(/_/g, " ");
};


/**
 * Un-escapes some HTML tags (<br>, <p>, <ul>, <li>, <hr>, <strong>, <em>, and <pre>);
 * turns wikilinks into real links. Ignores anything within <pre>...</pre> tags -- unless
 * wrapped with {{subst:^|}} (e.g. `{{subst:^|<strong>}}` is replaced with a real <strong> tag).
 * Input will first be escaped using #escapeHtml unless specified 
 * @param {String} text
 * @param {Object} config Configuration options
 *  @param {Boolean} config.noEscape - do not escape the input first
 * @returns {String} unescaped text
 */
const safeUnescape = function(text, config) {
	return ( config && config.noEscape ? text : escapeHtml(text))
	// Step 1: unescape <pre> tags
		.replace(  
			/&lt;(\/?pre\s?\/?)&gt;/g,
			"<$1>"
		)
	// Step 2: replace piped wikilinks with real links (unless inside <pre> tags)
		.replace( 
			/\[\[([^|\]]*?)\|([^|\]]*?)\]\](?![^<]*?<\/pre>)/g, function(_match, linkTarget, linkText) {
				return makeLink(linkTarget, linkText);
			}
		)
	// Step 3: replace other wikilinks with real links (unless inside <pre> tags)
		.replace( 
			/\[\[([^|\]]+?)]\](?![^<]*?<\/pre>)/g, function(_match, link) {
				return makeLink(link);
			}
		)
	// Step 4: unescape other tags (unless inside <pre> tags)
		.replace(
			/&lt;(\/?(?:br|p|ul|li|hr|strong|em)\s?\/?)&gt;(?![^<]*?<\/pre>)/g,
			"<$1>"
		)
	// Step 5: unescape tags warpped in {{subst:^|}}
		.replace(
			/{{subst:\^\|&lt;(\/?(?:br|p|ul|li|hr|strong|em)\s?\/?)&gt;}}/g,
			"<$1>"
		);
};

/**
 * Formats a date object as `d Mmmm YYYY`
 * @param {Date} date 
 * @returns {string} formatted date
 */
const dmyDateString = function(date) {
	return `${date.getUTCDate()} ${Month.nameFromIndex(date.getUTCMonth())} ${date.getUTCFullYear()}`;
};

/**
 * Formats a date object as `YYYY Mmmm d`
 * @param {Date} date
 * @returns {string} formatted date 
 */
const ymdDateString = function(date) {
	return `${date.getUTCFullYear()} ${Month.nameFromIndex(date.getUTCMonth())} ${date.getUTCDate()}`;
};

/**
 * Parses a date from its component parts
 * @param {String|Number} year 
 * @param {String|Number} day 
 * @param {String} monthName
 * @param {String} [time] time formatted as hh:mm
 * @returns {Date|NaN} Date object, or NaN if date could not be parsed
 */
const dateFromParts = function(year, monthName, day, time) {
	const month = Month.newFromMonthName(monthName);
	if ( !month.isValid() ) {
		return NaN;
	}
	var paddedDay = ( Number(day) < 10 ) ? "0" + day : day;
	var iso8601DateString = `${year}-${month.paddedNumber}-${paddedDay}T${time || "00:01"}Z`;
	return Date.parse(iso8601DateString) && new Date(iso8601DateString);
};

/**
 * Generates a JS Date object from the text of a timestamp
 * @param {String} sigTimestamp in format "`hh`:`mm`, `d` `Month` `yyyy` (UTC)", e.g. "09:42, 11 January 2019 (UTC)"
 * @returns {Date|NaN} Date object, or NaN if sigTimestamp could not be parsed
 */
const dateFromSigTimestamp = function(sigTimestamp) {
	const parts =  /(\d\d:\d\d), (\d{1,2}) (\w+) (\d\d\d\d) \(UTC\)/.exec(sigTimestamp);
	if ( parts === null ) {
		return NaN;
	}
	const [time, day, monthName, year] = parts.slice(1);
	return dateFromParts(year, monthName, day, time);
};

/**
 * Parses a date from a dated subpage, in `YY Mmmm d` format
 * @param {string} subpageName
 * @returns {Date|NaN} Date object, or NaN if date could not be parsed
 */
const dateFromSubpageName = function(subpageName) {
	const [year, monthName, day] = subpageName.split(" ");
	return dateFromParts(year, monthName, day);
};

/**
 * Parses a date from within text. Will find a date if formatted as
 * MDY, DMY, or YMD (e.g. "March 18, 2020" or "18 March 2020" or
 * "2020 March 18")
 * @param {string} text
 * @returns {Date|NaN} Date object, or NaN if date could not be parsed
 */
const dateFromUserInput = function(text) {
	let day, monthName, year;
	// Probably formatted like "18 March 2020" or "2020 March 18"
	const mdyParts =  /(\w+) (\d{1,2}), (\d\d\d\d)/.exec(text);
	const dmyParts =  /(\d{1,2}) (\w+) (\d{4})/.exec(text);
	const ymdParts =  /(\d{4}) (\w+) (\d{1,2})/.exec(text);
	switch(true) {
	case !!mdyParts:
		[monthName, day, year] = mdyParts.slice(1); break;
	case !!dmyParts:
		[day, monthName, year] = dmyParts.slice(1); break;
	case !!ymdParts:
		[year, monthName, day] = ymdParts.slice(1); break;
	default:
		return NaN;
	}
	const month = Month.newFromMonthShortName(monthName.slice(0,3));
	if ( !month.isValid() ) {
		return NaN;
	}
	return dateFromParts(year, month.name, day);
};

/**
 * Presents a confirmation dialog which can have multiple action buttons
 * @param {Object} config
 *  @param {String} config.title  Title for the dialogue
 *  @param {String} config.message  Message for the dialogue. HTML tags (except for <br>, <p>, <ul>,
 *   <li>, <hr>, and <pre> tags) are escaped; wikilinks are turned into real links.
 *  @param {Array} config.actions  Optional. Array of configuration objects for OO.ui.ActionWidget
 *   <https://doc.wikimedia.org/oojs-ui/master/js/#!/api/OO.ui.ActionWidget>.
 *   If not specified, the default actions are 'accept' (with label 'OK') and 'reject' (with
 *   label 'Cancel').
 *  @param {String} config.size  Symbolic name of the dialog size: small, medium, large, larger or full.
 *  @param {Boolean} [config.scrolled]  Whether the dialog should be translated to (and window scrolled to)
 *   the window vertical offset prior to the dialog opening. If not specified or false, the page will scroll
 *   to the top and the dialog will open there.  
 * @return {Promise<String>} action taken by user
 */
const multiButtonConfirm = function(config) {
	// Wrap message in a HtmlSnippet to prevent escaping
	const htmlSnippetMessage = new OO.ui.HtmlSnippet(
		safeUnescape(config.message)
	);

	const windowManager = new OO.ui.WindowManager();
	const messageDialog = config.scrolled
		? new ScrolledMessageDialog()
		: new OO.ui.MessageDialog();
	$("body").append( windowManager.$element );
	windowManager.addWindows( [ messageDialog ] );
	const instance = windowManager.openWindow( messageDialog, {
		"title": config.title,
		"message": htmlSnippetMessage,
		"actions": config.actions,
		"size": config.size,
		"scrollBy": config.scrolled && windowOffsetTop()
	} );
	return instance.closed.then(function(data) {
		windowManager.destroy();
		return data && data.action;
	});
};

/**
 * Presents a confirmation dialog for the user to select checkbox items
 * @param {Object} config
 *  @param {String} config.title  Title for the dialogue
 *  @param {String|JQuery} config.message Message for above the checkboxes
 *  @param {Object[]} config.items Checkbox items
 *   @param {*} config.items[].data Data for the checkbox item
 *   @param {String} config.items[].label Label for the checkbox item
 *   @param {Boolean} config.items[].selected Item is initial selected
 *  @param {String} config.size Symbolic name of the dialog size: small, medium,
 *   large, larger or full.
 *  @param {Boolean} [config.scrolled]  Whether the dialog should be translated to (and window scrolled to)
 *   the window vertical offset prior to the dialog opening
 * @return {Promise<Object<string,string|*[]>>} { action, items }
 *  where action is "accept" or "reject", and items is an array of the
 *  selected items' data
 */
const multiCheckboxMessageDialog = function(config) {
	const windowManager = new OO.ui.WindowManager();
	const messageDialog = config.scrolled
		? new ScrolledMessageDialog()
		: new OO.ui.MessageDialog();
	const selectAllCheckbox = new OO.ui.CheckboxMultioptionWidget({
		label: $("<strong>Select all</strong>"),
		selected: config.items.every(item => item.selected)
	});
	selectAllCheckbox.$element.css("margin-bottom", "10px");
	const checkboxMultiselect = new OO.ui.CheckboxMultiselectWidget( {
		items: config.items.map(item => new OO.ui.CheckboxMultioptionWidget(item))
	});
	selectAllCheckbox.on("change", function(selected) {
		checkboxMultiselect.getItems().forEach(item => item.setSelected(selected));
	});

	$("body").append( windowManager.$element );
	windowManager.addWindows( [ messageDialog ] );
	const instance = windowManager.openWindow( messageDialog, {
		"title": config.title,
		"message": $("<div>").append(
			config.message,
			config.items.length > 1 ? selectAllCheckbox.$element : null,
			checkboxMultiselect.$element
		),
		"actions": config.actions,
		"size": config.size,
		"scrollBy": config.scrolled && windowOffsetTop()
	} );
	return instance.closed.then(function(data) {
		windowManager.destroy();
		const action = data && data.action;
		return {
			action,
			items: checkboxMultiselect.findSelectedItemsData() 
		};
	});
};

/**
 * Checks if the input is a plain javascript object, based on
 * type and constructor 
 * @param {*} obj 
 */
const isPlainObject = function(obj) {
	return !!obj && typeof obj === "object" && obj.constructor === Object;
};

/**
 * Merge two objects recursively, including arrays. Returns a new object without modifying either input.
 * Keys present in both the target and the source take on the value of the source, except if:
 * - both values are plain objects, in which case those objects are merged
 * - both values are arrays, in which case those arrays are merged  
 * 
 * @param {Object} target
 * @param {Object} source
 * @returns {Object} merged object
 */
const recursiveMerge = (target, source) => {
	const result = {};
	// Get all keys from both objects
	const keys = Object.keys({...target, ...source});
	// Check if the value of each key is an array, or plain object, or neither
	keys.forEach(key => {
		if ( Array.isArray(target[key]) && Array.isArray(source[key]) ) {
			// Both values are arrays, so merge them
			result[key] = [...target[key], ...source[key]];
		} else if ( isPlainObject(target[key]) && isPlainObject(source[key])) {
			// Both values are plain objects, so recursively merge them
			result[key] = recursiveMerge(target[key], source[key]);
		} else if (source[key] === undefined) {
			// Key only exists on target, so use that value
			result[key] = target[key];
		} else {
			result[key] = source[key];
		}
	});
	return result;
};

/**
 * Returns a promise that is rejected (with the passed arguments, if any)
 * @param {*} ...args Rejection arguments
 * @return {Promise} Rejected promise
 */
const rejection = function() {
	return $.Deferred().reject(...arguments);
};

/**
 * Returns a promise that is resolved after a delay
 * @param {number} delay Timeout delay in milliseconds
 * @returns {Promise} Promise that will resolve after delay
 */
const timeout = function(delay) {
	const deferred = $.Deferred();
	setTimeout(deferred.resolve, delay);
	return deferred.promise();
};

/**
 * Removes duplicate values from an array. Values with different types are
 * considered unique, e.g. the number 1 is not dulicated by the string "1".
 * @param {*[]} array
 * @returns {*[]} array of unique values
 */
const uniqueArray = function(array) {
	const vals = {};
	array.forEach(val => {
		vals[`${val}___${typeof val}`] = val;
	});
	return Object.values(vals);
};

/**
 * Checks if a page is a file (in File: namespace)
 * 
 * @param {String} pageName
 * @returns {Boolean} page is a module
 */
const isFile = function(pageName) {
	return mw.Title.newFromText(pageName).getNamespaceId() === 6;
}; 

/**
 * Checks if a page is a module (in Module: namespace)
 * 
 * @param {String} pageName
 * @returns {Boolean} page is a module
 */
const isModule = function(pageName) {
	return mw.Title.newFromText(pageName).getNamespaceId() === 828; //"Module:";
};

/**
 * 
 * @param {String} pageName 
 * @returns {String} page name if not a module, or page name of the /doc subpage
 */
const moduleToDoc = function(pageName) {
	return isModule(pageName) ? pageName + "/doc" : pageName;
};

/**
 * 
 * @param {String} pageName 
 * @returns {String} page name if not a module, or page name without the /doc subpage
 */
const docToModule = function(pageName) {
	return isModule(pageName) ? pageName.replace(/\/doc$/, "") : pageName;
};

/**
 * Decodes HTML entities, e.g. "this &amp; that" to "this & that".
 * Also strips any HTML tags, leaving only the text content, e.g
 * "foo <strong>bar</strong> baz" to "foo bar baz"
 * 
 * @param {String} t text
 * @returns {string} decoded text
 */
const decodeHtml = function(t) {
	return $("<div>").html(t).text();
};

/**
 * Uppercases the first character of a string
 * @param {String} text
 * @returns {String} text with the initial character uppercased 
 */
function uppercaseFirst(text) {
	return text.slice(0, 1).toUpperCase() + text.slice(1);
}

/**
 * Returns the most frequently occuring item within an array,
 * e.g. `mostFrequent(["apple", "apple", "orange"])` returns `"apple"`
 * @param {string[]|number[]} array 
 * @returns {string|null} item with the highest frequency
 */
function mostFrequent(array) {
	if ( !array || !Array.isArray(array) || array.length === 0 )
		return null;
	const map = {};
	let mostFreq = null;
	array.forEach(item => {
		map[item] = (map[item] || 0) + 1;
		if (mostFreq === null || map[item] > map[mostFreq]) {
			mostFreq = item;
		}
	});
	return mostFreq;
}

/**
 * Normalises a page name (full namespace, initial caps, etc).
 * Fragments are retained, e.g "wp:foo#Section" => "Wikpedia:Foo#Section" 
 * @param {String} pageName
 * @returns {String|null} Normalised page name, or null if invalid 
 */
const normalisePageName = function(pageName) {
	const title = mw.Title.newFromText(pageName);
	if (title == null) { return null; }
	const prefixedText = title.getPrefixedText();
	const fragment = title.getFragment();
	if (fragment) {
		return prefixedText + "#" + fragment;
	}
	return prefixedText;
};

/**
 * Gets the window offset from top (scrolled amount)
 * @returns {number}
 */
const windowOffsetTop = function() {
	return window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
};

export {
	encodeForUrl,
	encodeForWikilinkFragment,
	makeLink,
	uniqueArray,
	safeUnescape,
	dmyDateString,
	ymdDateString,
	dateFromSigTimestamp,
	dateFromSubpageName,
	dateFromUserInput,
	multiButtonConfirm,
	multiCheckboxMessageDialog,
	recursiveMerge,
	rejection,
	timeout,
	isFile,
	isModule,
	moduleToDoc,
	docToModule,
	decodeHtml,
	uppercaseFirst,
	mostFrequent,
	normalisePageName,
	windowOffsetTop
};
// </nowiki>