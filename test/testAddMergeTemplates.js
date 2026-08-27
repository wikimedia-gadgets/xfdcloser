/* eslint-env node, mocha */
import assert from "assert";
import AddMergeTemplates from "../xfdcloser-src/Controllers/Tasks/AddMergeTemplates";

const fixtures = require("./fixtures/removeMergeAndAfdTemplates.json");

// Instantiate without the full constructor since removeMergeAndAfdTemplates only uses prototype methods
const task = Object.create(AddMergeTemplates.prototype);

describe("AddMergeTemplates.removeMergeAndAfdTemplates", function() {
	for (const [testName, testCase] of Object.entries(fixtures)) {
		it(testName, function() {
			const { oldWikicode, sourcePage, nominationName, expectedWikicode } = testCase;
			assert.strictEqual(
				task.removeMergeAndAfdTemplates(oldWikicode, sourcePage, nominationName),
				expectedWikicode
			);
		});
	}
});
