const _i18n = new window.$.i18n.constructor();
_i18n.locale = window.mw.config.get("wgContentLanguage");
// Create a private version of the $.i18n function.
const i18n = function(key, param1) {
	var parameters = param1 !== undefined ? Array.prototype.slice.call( arguments, 1 ) : [];
	return _i18n.parse( key, parameters );
};
// Load messages, save the promise in a variable so it can be exported
const loaded = window.$.getJSON(`https:${window.mw.config.get("wgServer")}/wiki/MediaWiki:Gadget-XFDcloser-messages.json?action=raw`)
	.then(messages => window.$.i18n().load(messages, _i18n.locale));

export default i18n;
export {loaded};