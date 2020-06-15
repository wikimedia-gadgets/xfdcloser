import { $, mw } from "../globals";
import API from "./api";
import config from "./config";
// <nowiki>

const prefsPage = `User:${mw.config.get("wgUserName")}/xfdcPrefs.json`;

const defaultPrefs = {
	watchlist: "preferences"
};

const getPrefs = () => API.get({
	"action": "query",
	"format": "json",
	"formatversion": "2",
	"prop": "revisions",
	"titles": prefsPage,
	"rvprop": "content",
	"rvslots": "main"
}).then(response => {
	const page = response.query.pages[0];
	if (page.missing || !page.pageid) {
		return defaultPrefs;
	}
	let prefs;
	try {
		prefs = JSON.parse( page.revisions[0].slots.main.content );
	} catch(e) {
		return $.Deferred().reject("JSON-parsing-error", e);
	}
	return prefs;
}).catch((code, error) => {
	console.warn("XFDcloser preferences not loaded", {code, error});
	mw.notify("Your XFDcloser preferences could not be loaded.");
	return defaultPrefs;
});

/**
 * 
 * @param {Object} updatedPrefs object with key:value pairs for preferences json.
 */
const setPrefs = updatedPrefs => API.editWithRetry(prefsPage, null, () => ({
	"text": JSON.stringify(updatedPrefs),
	"summary": "Saving XFDcloser preferences " + config.script.advert
})
);

export { getPrefs, setPrefs, defaultPrefs };
// </nowiki>