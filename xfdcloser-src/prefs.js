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
	"prop": "revisions",
	"titles": prefsPage,
	"rvprop": "content",
	"rvslots": "main"
}).then(response => {
	const page = response.query.pages[Object.keys(response.query.pages)[0]];
	if (!page.pageid || page.missing==="") {
		return defaultPrefs;
	}
	let prefs;
	try {
		prefs = JSON.parse( page.revisions[0].slots.main["*"] );
	} catch(e) {
		return $.Deferred().reject("JSON-parsing-error", e);
	}
	return prefs;
});

/**
 * 
 * @param {Object} updatedPrefs object with key:value pairs for preferences json.
 */
const setPrefs = updatedPrefs => API.editWithRetry(prefsPage, null, () => ({
	"text": JSON.stringify(updatedPrefs),
	"summary": "Saving Rater preferences " + config.script.advert
})
);

export { getPrefs, setPrefs, defaultPrefs };
// </nowiki>