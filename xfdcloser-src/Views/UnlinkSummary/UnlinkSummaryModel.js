// <nowiki>
const timeout = function(delay) {
	const deferred = $.Deferred();
	setTimeout(deferred.resolve, delay);
	return deferred.promise();
};

/**
 * Model for UnlinkSummaryView
 *
 * @param {Object} config
 * @param {String} [config.summary] Initial summary
 * @param {String} config.advert Advert for edit summary
 * @param {mw.Api} config.api
 */
class UnlinkSummaryModel {
	constructor(config) {
		config = config || {};
		this.summary = config.summary || "";
		this.summaryErrors = [];
		this.parsedSummary = "";
		this.parseErrors = [];
		// Private properties
		this._advert = config.advert;
		this._api = config.api;
		this._delay = config.delay || 800;
		this._requestId = 0;
		// call mixin constructor
		OO.EventEmitter.call(this);
	}
	setSummaryValue(summary) {
		if (summary === this.summary) {
			return;
		}
		this.summary = summary;
		if (summary) {
			this.summaryErrors = [];
			this.parseSummary(summary);
		} else {
			this.summaryErrors = ["A reason is required"];
			this.parsedSummary = "";
			this.parseErrors = [];
		}		
		this.emit("update");
	}
	parseSummary(summary) {
		const requestId = ++this._requestId;
		// Wait for a short delay and check if this is still the latest requestId,
		// to avoid making unnessary api calls.
		timeout(this._delay).then(() => {
			if (requestId < this._requestId)
				return;
			this._api.get({
				action: "parse",
				contentmodel: "wikitext",
				summary: `Removing link(s): ${summary} ${this._advert}`,
				prop: "text",
				disablelimitreport: 1,
				format: "json",
				formatversion: "2"
			}).then(result => {
				// Prevent older requests overwriting newer requests
				if (requestId < this.requestId || !this.isValid) {
					return;
				}
				this.parsedSummary = result.parse.parsedsummary;
				this.parseErrors = [];
				this.emit("update");
			}, errorCode => {
				// Prevent older requests overwriting newer requests
				if (requestId < this.requestId)
					return false;
				this.parsedSummary = "";
				this.parseErrors = [`Preview failed: ${errorCode || "unknown"} error`];
				this.emit("update");
			});
		});
	}
}

// Derived properties
Object.defineProperty( UnlinkSummaryModel.prototype, "isValid", {
	get: function () {
		return !!this.summary;
	}
} );

OO.initClass( UnlinkSummaryModel );
OO.mixinClass( UnlinkSummaryModel, OO.EventEmitter );

export default UnlinkSummaryModel;
// </nowiki>
