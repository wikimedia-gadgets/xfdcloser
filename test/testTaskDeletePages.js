/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import DeletePages from "../xfdcloser-src/Controllers/Tasks/DeletePages";
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

describe("DeletePages", function() {
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
		result.singleModeResult.setSelectedResultName("delete");
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new DeletePages(model, widgets);
	});
	it("verifies existing page", function() {
		result = task.verifyPage("Foobar");
		assert.strictEqual(result, true);
	});
	it("verifies non-existing page", function() {
		result = task.verifyPage("Fooqux");
		assert.strictEqual(result, false);
	});
	it("rejects doTask if no pages exists", function() {
		mw.Title.exist.set(discussion.pages.map(t => t.getPrefixedDb()), false);
		const taskPromise = task.doTask();
		if ( !taskPromise.then ) {
			throw new Error("doTask did not return a promise");
		}
		return taskPromise
			.then(() => {
				throw new Error("doTask promise was resolved");
			})
			.catch(function() {
				// rejection without arguments expected
				assert.strictEqual(arguments.length, 0); 
			});
	});
});
