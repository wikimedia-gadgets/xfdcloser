/* eslint-env node, mocha */
import assert from "assert";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const removeMergeAndAfdTemplates = require("../move-somewhere-else/removeMergeAndAfdTemplates");
const fixtures = require("./fixtures/removeMergeAndAfdTemplates.json");

describe("removeMergeAndAfdTemplates", function() {
	for (const [testName, testCase] of Object.entries(fixtures)) {
		it(testName, function() {
			const { oldWikicode, sourcePage, nominationName, expectedWikicode } = testCase;
			assert.strictEqual(
				removeMergeAndAfdTemplates(oldWikicode, sourcePage, nominationName),
				expectedWikicode
			);
		});
	}
});
