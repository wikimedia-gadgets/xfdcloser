/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import RemoveCircularLinks from "../xfdcloser-src/Controllers/Tasks/RemoveCircularLinks";
import TaskItem from "../xfdcloser-src/Models/TaskItem";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";

// Mock widgets
const noop = () => {};
const widgets = {
	field: {
		setLabel: noop,
		setNotices: noop,
		setWarnings: noop,
		setErrors: noop,
	},
	progressbar: {
		setProgress: noop,
		toggle: noop
	},
	emit: ()=>{}
};

// Note: transform method can not be unit tested since it uses extraJs.unlink
describe("RemoveCircularLinks", function() {
	describe("for single page", function() {
		let discussion, result, options, model, task;
		beforeEach(function() {
			discussion = new Discussion({
				id: "id",
				venue: Venue.Afd(),
				pages: ["Foobar"].map(t => mw.Title.newFromText(t)),
				discussionPageName: "Wikipedia:Articles for deletion/Foobar",
				sectionHeader: "Foobar",
				sectionNumber: 1,
				firstCommentDate: new Date("2020-03-18T12:22Z"),
				isRelisted: false,
				userIsSysop: true
			});	
			mw.Title.exist.set(discussion.pages.map(t => t.getPrefixedDb()), true);
			discussion.nominationDate = discussion.firstCommentDate;
			result = new Result({
				discussion,
				type: "close",
				userIsSysop: true
			});
			options = new Options({
				result,
				venue: discussion.venue,
				userIsSysop: true
			});
			result.singleModeResult.setSelectedResultName("redirect");
			result.singleModeResult.setTargetPageName("Foo qux");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new RemoveCircularLinks(model, widgets);
		});
		it("gets the unique target pages", function() {
			assert.deepStrictEqual(task.targets, ["Foo qux"]);
		});
		it("gets the names of pages to be unlinked", function() {
			assert.deepStrictEqual(task.pageNamesToUnlink, ["Foobar"]);
		});
	});

	describe("multiple pages, one is the target", function() {
		let discussion, result, options, model, task;
		beforeEach(function() {
			discussion = new Discussion({
				id: "id",
				venue: Venue.Afd(),
				pages: ["Foobar", "Qux"].map(t => mw.Title.newFromText(t)),
				discussionPageName: "Wikipedia:Articles for deletion/Foobar",
				sectionHeader: "Foobar",
				sectionNumber: 1,
				firstCommentDate: new Date("2020-03-18T12:22Z"),
				isRelisted: false,
				userIsSysop: true
			});	
			mw.Title.exist.set(discussion.pages.map(t => t.getPrefixedDb()), true);
			discussion.nominationDate = discussion.firstCommentDate;
			result = new Result({
				discussion,
				type: "close",
				userIsSysop: true
			});
			options = new Options({
				result,
				venue: discussion.venue,
				userIsSysop: true
			});
			result.singleModeResult.setSelectedResultName("redirect");
			result.singleModeResult.setTargetPageName("Qux");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new RemoveCircularLinks(model, widgets);
		});
		it("gets the unique target pages", function() {
			assert.deepStrictEqual(task.targets, ["Qux"]);
		});
		it("gets the names of pages to be unlinked", function() {
			assert.deepStrictEqual(task.pageNamesToUnlink, ["Foobar"]);
		});
	});
});