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
	it("has a working mock of mw.Title", function() {
		assert.ok(mw.Title.newFromText("Wikipedia:Foo"), "newFromText (valid title)");
		assert.doesNotThrow(function() { mw.Title.newFromText(""); },  "newFromText (invalid, does not throw error)");
		assert.equal(mw.Title.newFromText(""), null,  "newFromText (invalid, returns null)");
		assert.doesNotThrow(function() { new mw.Title("Foo"); }, "new (valid)");
		assert.throws(function() { new mw.Title(""); }, "new (invalid, throws error)");
		assert.equal(mw.Title.newFromText("Wikipedia:Foo").getNamespaceId(), 4, "getNamespaceId");
	});
});
