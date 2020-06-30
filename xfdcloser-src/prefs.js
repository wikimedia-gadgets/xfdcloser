import { mw } from "../globals";
import config from "./config";
import { defaultPrefValues } from "./data";
// <nowiki>

// Use a new mw.API instance so that preferences can be imported to our API class
const API = new mw.Api({
	ajax: {
		headers: { 
			"Api-User-Agent": `XFDcloser/${config.script.version} ( https://en.wikipedia.org/wiki/WP:XFDC )`
		}
	}
});

/**
 * @returns {Object<string,string|number|boolean>} Object of option values keyed by name
 */
const parseOptions = () => {
	try {
		return JSON.parse(mw.user.options.get("userjs-xfdc")) || {};
	} catch(e) {
		return {};
	}
};

/**
 * 
 * @param {string} [prefName] name of preference to get, omit to get all preferences
 * @return {string|number|boolean} user or default preference value
 */
const get = prefName => {
	const options = parseOptions();
	if ( prefName ) {
		const val = options[prefName];
		return val !== undefined ? val : defaultPrefValues[prefName];
	}
	return { ...defaultPrefValues, ...options };
};

/**
 * 
 * @param {Object<string,*>} prefs new preference values, keyed by preference name
 * @param {Object} [mode]
 *  @param {boolean} mode.reset unset all current preferences
 * @returns {Promise} resolved if saved successfully
 */
const set = (prefs, mode) => {
	const previousOptions = parseOptions();
	const options = JSON.stringify( mode && mode.reset
		? prefs
		: { ...previousOptions, ...prefs }
	);
	return API.postWithToken("csrf", {
		"action": "options",
		"format": "json",
		"formatversion": "2",
		"optionname": "userjs-xfdc",
		"optionvalue": options
	}).then(() => {
		mw.user.options.set("userjs-xfdc", options);
		mw.notify("XFDcloser preferences updated successfully");
	});
};

export { get, set };
// </nowiki>