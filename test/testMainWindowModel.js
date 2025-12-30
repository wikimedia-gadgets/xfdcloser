/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import MainWindowModel from "../xfdcloser-src/Models/MainWindowModel";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";

describe("MainWindowModel", function() {
	let model;
	const resetModel = function() {
		const discussion = new Discussion({
			id: "123",
			venue: Venue.Afd(),
			pages: [mw.Title.newFromText("Foo")],
			discussionPageName: "Wikipedia:Articles for deletion/Foo",
			sectionHeader: "Foo",
			sectionNumber: "1",
			firstCommentDate: new Date(2020, 5, 1),
			isRelisted: false,
		});
		model = new MainWindowModel({
			discussion: discussion,
			type: "close",
			userIsSysop: true
		});
	};
	describe("Mode", function() {
		beforeEach(resetModel);
		it("is initially \"normal\"", function() {
			assert.strictEqual(model.mode , "normal");
		});
		it("can be set", function() {
			model._setMode("foo");
			assert.strictEqual(model.mode, "foo");
		});
		it("can be set to a previous mode using \"_previous\"", function() {
			model._setMode("foo");
			assert.strictEqual(model.mode, "foo");
			model._setMode("bar");
			assert.strictEqual(model.mode, "bar");
			model._setMode("_previous");
			assert.strictEqual(model.mode, "foo");
		});
	});
});
