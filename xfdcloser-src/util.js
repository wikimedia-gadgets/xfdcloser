// <nowiki>

/**
 * Un-escapes some HTML tags (<br>, <p>, <ul>, <li>, <hr>, <strong>, <em>, and <pre>);
 * turns wikilinks into real links. Ignores anything within <pre>...</pre> tags -- unless
 * wrapped with {{subst:^|}} (e.g. `{{subst:^|<strong>}}` is replaced with a real <strong> tag).
 * Input will first be escaped using mw.html.escape() unless specified 
 * @param {String} text
 * @param {Object} config Configuration options
 * @config {Boolean} noEscape - do not escape the input first
 * @returns {String} unescaped text
 */
var safeUnescape = function(text, config) {
	return ( config && config.noEscape && text || mw.html.escape(text) )
	// Step 1: unescape <pre> tags
		.replace(  
			/&lt;(\/?pre\s?\/?)&gt;/g,
			"<$1>"
		)
	// Step 2: replace piped wikilinks with real links (unless inside <pre> tags)
		.replace( 
			/\[\[([^|\]]*?)\|([^|\]]*?)\]\](?![^<]*?<\/pre>)/g,
			"<a href=\"" + mw.util.getUrl("$1") + "\" target=\"_blank\">$2</a>"
		)
	// Step 3: replace other wikilinks with real links (unless inside <pre> tags)
		.replace( 
			/\[\[([^|\]]+?)]\](?![^<]*?<\/pre>)/g,
			"<a href=\"" + mw.util.getUrl("$1") + "\" target=\"_blank\">$1</a>"
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

export { safeUnescape };
// </nowiki>