/* eslint-env node, mocha */
import assert from "assert";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const removeTagsFromTargetPage = require("../move-somewhere-else/transformTargetPage");
const fixtures = require("./fixtures/transformTargetPage.json");

describe("removeTagsFromTargetPage", function() {
	it("removes a merge tag when the source page is inside it", function() {
		const { oldWikicode, sourcePage, nominationName, expectedWikicode } = fixtures["delete template when sourcePage is inside of it"];

		assert.strictEqual(
			removeTagsFromTargetPage(oldWikicode, sourcePage, nominationName),
			expectedWikicode
		);
	});
});
