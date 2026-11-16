/* eslint-env node, mocha */
import assert from "assert";
import AddMergeTemplates from "../xfdcloser-src/Controllers/Tasks/AddMergeTemplates";

const fixtures = require("./fixtures/removeMergeTemplatesFromWikicode.json");

// Instantiate without the full constructor since removeMergeTemplatesFromWikicode only uses prototype methods
const task = Object.create(AddMergeTemplates.prototype);

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
