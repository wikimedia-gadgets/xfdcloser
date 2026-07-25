/* eslint-env node, mocha */
import assert from "assert";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const removeTagsFromTargetPage = require("../move-somewhere-else/transformTargetPage");
const fixtures = require("./fixtures/transformTargetPage.json");

describe("removeTagsFromTargetPage", function() {
	for (const [testName, testCase] of Object.entries(fixtures)) {
		it(testName, function() {
			const { oldWikicode, sourcePage, nominationName, expectedWikicode } = testCase;
			assert.strictEqual(
				removeTagsFromTargetPage(oldWikicode, sourcePage, nominationName),
				expectedWikicode
			);
		});
	}
});
