/* eslint-env node, mocha */
import assert from "assert";
import { $, mw, OO } from "../globals";

describe("Globals", function() {
	it("has loaded jQuery", function() {
		assert.ok($);
		assert.ok($.Deferred);
	});
	it("has loaded OOjs", function() {
		assert.ok(OO);
	});
	it("has loaded mw.Title", function() {
		assert.ok(mw, "mw exists");
		assert.ok(mw.Title, "mw.Title exists");
	});
	describe("mw.Title", function() {
		it("newFromText", function() {
			assert.ok(mw.Title.newFromText("Wikipedia:Foo"), "newFromText (valid title)");
			assert.doesNotThrow(function() { mw.Title.newFromText(""); },  "newFromText (invalid, does not throw error)");
			assert.equal(mw.Title.newFromText(""), null,  "newFromText (invalid, returns null)");
		});
		it("constructor", function() {
			assert.doesNotThrow(function() { new mw.Title("Foo"); }, "new (valid)");
			assert.throws(function() { new mw.Title(""); }, "new (invalid, throws error)");
		});
		it("getNamespaceId", function() {
			assert.equal(mw.Title.newFromText("Wikipedia:Foo").getNamespaceId(), 4, "getNamespaceId");
		});
		it("makeTitle", function() {
			assert.equal(mw.Title.makeTitle(4,"Foo").getPrefixedText(), "Wikipedia:Foo", "makeTitle");
			assert.equal(mw.Title.makeTitle(0,"Foo").getPrefixedText(), "Foo", "makeTitle");
		});
		it("getTalkPage", function() {
			assert.equal(mw.Title.newFromText("Foo").getTalkPage().getPrefixedText(), "Talk:Foo", "from mainspace");
			assert.equal(mw.Title.newFromText("Talk:Foo").getTalkPage().getPrefixedText(), "Talk:Foo", "from talkpspace");
			assert.equal(mw.Title.newFromText("Special:Watchlist").getTalkPage(), null, "from special ns");
		});
		it("getSubjectPage", function() {
			assert.equal(mw.Title.newFromText("Foo").getSubjectPage().getPrefixedText(), "Foo", "from mainspace");
			assert.equal(mw.Title.newFromText("Talk:Foo").getSubjectPage().getPrefixedText(), "Foo", "from talkpspace");
			assert.equal(mw.Title.newFromText("Special:Watchlist").getSubjectPage().getPrefixedText(), "Special:Watchlist", "from special ns");
		});
	});
});
