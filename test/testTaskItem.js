/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import TaskItem from "../xfdcloser-src/Models/TaskItem";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
import Venue from "../xfdcloser-src/Venue";

// Value for indtertimate progress per https://doc.wikimedia.org/oojs-ui/master/js/#!/api/OO.ui.ProgressBarWidget
const indeterminateProgress = false;

describe("TaskItem", function() {
	let venue, userIsSysop, discussion, result, options, taskItem;
	it("exists", function() {
		assert.ok(TaskItem);
	});
	describe("initially", function() {
		before(function() {
			venue = Venue.Afd();
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
			result = new Result({
				discussion,
				type: "close",
				userIsSysop			
			});
			options = new Options({
				result,
				venue,
				userIsSysop
			});
			taskItem = new TaskItem({
				displayName: "some task",
				relaventPageNames: ["Foo", "Bar"],
				discussion,
				result,
				options
			});
		});
		it("shows progress bar", function() {
			assert.strictEqual(taskItem.showProgressBar, true);
		});
		it("has zero progress", function() {
			assert.strictEqual(taskItem.progress, 0);
		});
		it("has a \"Waiting...\" notice", function() {
			assert.deepStrictEqual(taskItem.notices, ["Waiting..."]);
		});
		it("has no warnings", function() {
			assert.deepStrictEqual(taskItem.warnings, []);
		});
		it("has no errors", function() {
			assert.deepStrictEqual(taskItem.errors, []);
		});
		it("initially has no steps", function() {
			assert.deepStrictEqual(taskItem.steps, {
				total: 0,
				completed: 0,
				skipped: 0,
				failed: 0
			});
		});
	});
	describe("when started", function() {
		before(function() {
			venue = Venue.Afd();
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
			result = new Result({
				discussion,
				type: "close",
				userIsSysop			
			});
			options = new Options({
				result,
				venue,
				userIsSysop
			});
			taskItem = new TaskItem({
				displayName: "some task",
				relaventPageNames: ["Foo", "Bar"],
				discussion,
				result,
				options
			});
			taskItem.start();
			taskItem.setStarted();
		});
		it("shows progress bar", function() {
			assert.strictEqual(taskItem.showProgressBar, true);
		});
		it("has indeterminate progress", function() {
			assert.strictEqual(taskItem.progress, indeterminateProgress);
		});
		it("has a \"Doing...\" notice", function() {
			assert.deepStrictEqual(taskItem.notices, ["Doing..."]);
		});
		it("has no warnings", function() {
			assert.deepStrictEqual(taskItem.warnings, []);
		});
		it("has no errors", function() {
			assert.deepStrictEqual(taskItem.errors, []);
		});
		it("initially has no steps", function() {
			assert.deepStrictEqual(taskItem.steps, {
				total: 0,
				completed: 0,
				skipped: 0,
				failed: 0
			});
		});
	});
	describe("with a single step", function() {
		before(function() {
			venue = Venue.Afd();
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
			result = new Result({
				discussion,
				type: "close",
				userIsSysop			
			});
			options = new Options({
				result,
				venue,
				userIsSysop
			});
			taskItem = new TaskItem({
				displayName: "some task",
				relaventPageNames: ["Foo", "Bar"],
				discussion,
				result,
				options
			});
			taskItem.start();
			taskItem.setStarted();
			taskItem.setTotalSteps(1);
		});
		it("has one step total", function() {
			assert.strictEqual(taskItem.steps.total, 1);
		});
		it("shows progress bar", function() {
			assert.strictEqual(taskItem.showProgressBar, true);
		});
		it("shows step count in notice", function() {
			assert.deepStrictEqual(taskItem.notices, ["Doing... (0 / 1)"]);
		});
		it("has indeterminate progress", function() {
			assert.strictEqual(taskItem.progress, indeterminateProgress);
		});
	});
	describe("with multiple steps", function() {
		beforeEach(function() {
			venue = Venue.Afd();
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
			result = new Result({
				discussion,
				type: "close",
				userIsSysop			
			});
			options = new Options({
				result,
				venue,
				userIsSysop
			});
			taskItem = new TaskItem({
				displayName: "some task",
				relaventPageNames: ["Foo", "Bar"],
				discussion,
				result,
				options
			});
			taskItem.start();
			taskItem.setStarted();
			taskItem.setTotalSteps(5);
		});

		it("has zero progress before steps are tracked", function() {
			assert.strictEqual(taskItem.progress, 0);
		});
		it("completing steps increments progress", function() {
			taskItem.trackStep();
			assert.strictEqual(taskItem.progress, 1/5*100);
			taskItem.trackStep();
			assert.strictEqual(taskItem.progress, 2/5*100);
			taskItem.trackStep();
			assert.strictEqual(taskItem.progress, 3/5*100);
			taskItem.trackStep();
			assert.strictEqual(taskItem.progress, 4/5*100);
			taskItem.trackStep();
			assert.strictEqual(taskItem.progress, 100);
		});
		it("skipping steps increments progress", function() {
			taskItem.trackStep();
			assert.strictEqual(taskItem.progress, 1/5*100);
			taskItem.trackStep("skipped");
			assert.strictEqual(taskItem.progress, 2/5*100);
			taskItem.trackStep();
			assert.strictEqual(taskItem.progress, 3/5*100);
			taskItem.trackStep("skipped");
			assert.strictEqual(taskItem.progress, 4/5*100);
			taskItem.trackStep("skipped");
			assert.strictEqual(taskItem.progress, 100);
		});
		it("failing steps do not increment progress", function() {
			taskItem.trackStep("failed");
			assert.strictEqual(taskItem.progress, 0);
			taskItem.trackStep();
			assert.strictEqual(taskItem.progress, 1/5*100);
			taskItem.trackStep("failed");
			assert.strictEqual(taskItem.progress, 1/5*100);
			taskItem.trackStep("skipped");
			assert.strictEqual(taskItem.progress, 2/5*100);
			taskItem.trackStep("failed");
			assert.strictEqual(taskItem.progress, 2/5*100);
		});
		it("shows step count in notice", function() {
			taskItem.trackStep();
			assert.deepStrictEqual(taskItem.notices, ["Doing... (1 / 5)"]);
			taskItem.trackStep();
			assert.deepStrictEqual(taskItem.notices, ["Doing... (2 / 5)"]);
			taskItem.trackStep();
			assert.deepStrictEqual(taskItem.notices, ["Doing... (3 / 5)"]);
			taskItem.trackStep();
			assert.deepStrictEqual(taskItem.notices, ["Doing... (4 / 5)"]);
			taskItem.trackStep();
			assert.deepStrictEqual(taskItem.notices, ["Doing... (5 / 5)"]);
		});
	});
	describe("errors", function() {
		beforeEach(function() {
			venue = Venue.Afd();
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
			result = new Result({
				discussion,
				type: "close",
				userIsSysop			
			});
			options = new Options({
				result,
				venue,
				userIsSysop
			});
			taskItem = new TaskItem({
				displayName: "some task",
				relaventPageNames: ["Foo", "Bar"],
				discussion,
				result,
				options
			});
			taskItem.start();
			taskItem.setStarted();
			taskItem.setTotalSteps(5);
		});
		it("accumulate into an array", function() {
			taskItem.addError("Foo");
			assert.deepStrictEqual(taskItem.errors, ["Foo"]);
			taskItem.addError("Bar");
			assert.deepStrictEqual(taskItem.errors, ["Foo", "Bar"]);
			taskItem.addError("Baz");
			assert.deepStrictEqual(taskItem.errors, ["Foo", "Bar", "Baz"]);
		});
	});
	describe("warnings", function() {
		beforeEach(function() {
			venue = Venue.Afd();
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
			result = new Result({
				discussion,
				type: "close",
				userIsSysop			
			});
			options = new Options({
				result,
				venue,
				userIsSysop
			});
			taskItem = new TaskItem({
				ndisplayNameame: "some task",
				relaventPageNames: ["Foo", "Bar"],
				discussion,
				result,
				options
			});
			taskItem.start();
			taskItem.setStarted();
			taskItem.setTotalSteps(5);
		});
		it("accumulate into an array", function() {
			taskItem.addWarning("Foo");
			assert.deepStrictEqual(taskItem.warnings, ["Foo"]);
			taskItem.addWarning("Bar");
			assert.deepStrictEqual(taskItem.warnings, ["Foo", "Bar"]);
			taskItem.addWarning("Baz");
			assert.deepStrictEqual(taskItem.warnings, ["Foo", "Bar", "Baz"]);
		});
	});
	describe("when completed", function() {
		beforeEach(function() {
			venue = Venue.Afd();
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
			result = new Result({
				discussion,
				type: "close",
				userIsSysop			
			});
			options = new Options({
				result,
				venue,
				userIsSysop
			});
			taskItem = new TaskItem({
				displayName: "some task",
				relaventPageNames: ["Foo", "Bar"],
				discussion,
				result,
				options
			});
			taskItem.start();
			taskItem.setStarted();
			taskItem.setTotalSteps(2);
		});
		it("sets the done property when all completed", function() {
			assert.strictEqual(taskItem.done, false);
			taskItem.trackStep();
			taskItem.trackStep();
			taskItem.setDone();
			assert.strictEqual(taskItem.done, true);
		});
		it("sets the done property when all either completed or skipped", function() {
			assert.strictEqual(taskItem.done, false);
			taskItem.trackStep();
			taskItem.trackStep("skipped");
			taskItem.setDone();
			assert.strictEqual(taskItem.done, true);
		});
		it("sets the failed property when all staps fail", function() {
			assert.strictEqual(taskItem.done, false);
			taskItem.trackStep("failed");
			taskItem.trackStep("failed");
			taskItem.setDone();
			assert.strictEqual(taskItem.failed, true, "failed===true");
			assert.strictEqual(taskItem.done, false, "done===false");
			assert.strictEqual(taskItem.showProgressBar, false, "showProgressBar===false");
			assert.deepStrictEqual(taskItem.notices, [], "notices is empty");
		});
		it("does not show progress bar", function() {
			taskItem.trackStep();
			taskItem.trackStep();
			taskItem.setDone();
			assert.strictEqual(taskItem.showProgressBar, false);
		});
		it("has no notice", function() {
			taskItem.trackStep();
			taskItem.trackStep();
			taskItem.setDone();
			assert.deepStrictEqual(taskItem.notices, []);
		});
		it("shows a \"Done!\" message if all steps are completed", function() {
			taskItem.trackStep();
			taskItem.trackStep();
			taskItem.setDone();
			assert.strictEqual(taskItem.label, "some task: Done! (2/2)");
		});
		it("shows a \"Done!\" message if some steps are completed", function() {
			taskItem.trackStep();
			taskItem.trackStep("skipped");
			taskItem.setDone();
			assert.strictEqual(taskItem.label, "some task: Done! (1/2)");
		});
		it("shows a \"Skipped.\" message if no steps are completed", function() {
			taskItem.trackStep("skipped");
			taskItem.trackStep("skipped");
			taskItem.setDone();
			assert.strictEqual(taskItem.label, "some task: Skipped (2)");
		});
		it("can not be aborted", function() {
			assert.strictEqual(taskItem.done, false);
			assert.strictEqual(taskItem.aborted, false);
			taskItem.trackStep();
			taskItem.setDone();
			taskItem.setAborted();
			assert.strictEqual(taskItem.done, true);
			assert.strictEqual(taskItem.aborted, false);

		});
	});
	describe("when aborted", function() {
		beforeEach(function() {
			venue = Venue.Afd();
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
			result = new Result({
				discussion,
				type: "close",
				userIsSysop			
			});
			options = new Options({
				result,
				venue,
				userIsSysop
			});
			taskItem = new TaskItem({
				displayName: "some task",
				relaventPageNames: ["Foo", "Bar"],
				discussion,
				result,
				options
			});
			taskItem.start();
			taskItem.setStarted();
			taskItem.setTotalSteps(2);
		});
		it("sets the aborted property", function() {
			assert.strictEqual(taskItem.aborted, false);
			taskItem.setAborted();
			assert.strictEqual(taskItem.aborted, true);
		});
		it("does not show progress bar", function() {
			taskItem.setAborted();
			assert.strictEqual(taskItem.showProgressBar, false);
		});
		it("has no notice", function() {
			taskItem.setAborted();
			assert.deepStrictEqual(taskItem.notices, []);
		});
		it("shows a plain \"Aborted\" message if no steps are completed", function() {
			taskItem.setAborted();
			assert.deepStrictEqual(taskItem.label, "some task: Aborted");
		});
		it("shows an \"Aborted\" message with completion count if some steps are completed", function() {
			taskItem.trackStep();
			taskItem.setAborted();
			assert.deepStrictEqual(taskItem.label, "some task: Aborted (after completing 1/2)");
		});
	});
});
