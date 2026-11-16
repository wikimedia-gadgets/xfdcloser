/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import TaskList from "../xfdcloser-src/Models/TaskList";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
import Venue from "../xfdcloser-src/Venue";

describe("TaskListModel", function() {
	let model, discussion, result, options, venue, userIsSysop;
	beforeEach(function() {
		userIsSysop = true;
		venue = Venue.Afd();
		discussion = new Discussion({
			id: "123",
			venue,
			pages: ["Foo", "Bar"].map(t => mw.Title.newFromText(t)),
			discussionPageName: "Wikipedia:Articles for deletion/Foo",
			sectionHeader: "Foo",
			sectionNumber: "1",
			firstCommentDate: new Date(2020, 5, 1),
			isRelisted: false,
			userIsSysop
		});
		result = new Result({
			discussion,
			type: "close",
			userIsSysop
		});
		options = new Options({
			result,
			venue,
			userIsSysop,
		});
		model = new TaskList({
			discussion,
			result,
			options
		});
	});
	it("exists", function() {
		assert.ok(TaskList);
	});
	it("can be instantiated", function() {
		assert.ok(model);
	});
	// TODO: replace above with more useful tests 
});
