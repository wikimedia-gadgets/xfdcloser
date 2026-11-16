/* eslint-env node, mocha */
import assert from "assert";
import RemoveMergeTemplates from "../xfdcloser-src/Controllers/Tasks/RemoveMergeTemplates";

const fixtures = require("./fixtures/removeMergeTemplates.json");

// Instantiate without the full constructor since removeMergeTemplatesFromWikicode only uses prototype methods
const task = Object.create(RemoveMergeTemplates.prototype);

describe("RemoveMergeTemplates.removeMergeTemplatesFromWikicode", function() {
	for (const [testName, testCase] of Object.entries(fixtures)) {
		it(testName, function() {
			const { oldWikicode, sourcePage, nominationName, expectedWikicode } = testCase;
			assert.strictEqual(
				task.removeMergeTemplatesFromWikicode(oldWikicode, sourcePage, nominationName),
				expectedWikicode
			);
		});
	}
});
