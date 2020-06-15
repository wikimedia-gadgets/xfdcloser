/* globals global, require */
// <nowiki>

// Setup jQuery, OOjs, and window
const { JSDOM } = require("jsdom");
const { window } = new JSDOM( "" );
const jQueryInstance = require("jquery"); 
const $ = jQueryInstance( window );
global.$ = jQueryInstance( window );
const OO = require("oojs");
OO.ui = {
	HtmlSnippet: function(content) { this.content = content; }
}
global.window = window;

// Set up mock mw object (with just enough to get tests running without errors)
const Title = require("./mocks/mockMwTitle").default;
const mw  = {
	Title,
	config: {
		get: () => ({wgUserGroups: [], wgPageName:"wgPageName"})
	},
	Api: () => {}
};

export { $, OO, mw };
// </nowiki>