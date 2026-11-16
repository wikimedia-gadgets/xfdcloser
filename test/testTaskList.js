/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import TaskList from "../xfdcloser-src/Models/TaskList";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
import Venue from "../xfdcloser-src/Venue";
import { getRelevantActions } from "../xfdcloser-src/data";

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
	it("schedules removal after adding templates for AFD merge pages", function() {
		result.setMultimode(true);
		result.multimodeResults.getItems()[0].setSelectedResultName("merge");
		result.multimodeResults.getItems()[1].setSelectedResultName("keep");
		const tasks = model.makeItemsForClose();
		const add = tasks.find(task => task.taskName === "AddMergeTemplates");
		const remove = tasks.find(task => task.taskName === "RemoveMergeTemplates");
		assert.ok(add);
		assert.ok(remove);
		assert.deepStrictEqual(remove.pageNames, ["Foo"]);
		assert.strictEqual(remove.precedingTask.task, add);
		assert.strictEqual(remove.canProceed(), false);
		add.trackStep();
		add.setDone();
		assert.strictEqual(remove.canProceed(), true);
		assert.strictEqual(remove.starting, true);
	});
	it("starts removal after the add task fails", function() {
		result.singleModeResult.setSelectedResultName("merge");
		const tasks = model.makeItemsForClose();
		const add = tasks.find(task => task.taskName === "AddMergeTemplates");
		const remove = tasks.find(task => task.taskName === "RemoveMergeTemplates");
		add.setFailed();
		assert.strictEqual(remove.canProceed(), true);
		assert.strictEqual(remove.starting, true);
	});
	it("does not schedule removal for no automated actions or non-merge results", function() {
		result.singleModeResult.setSelectedResultName("merge");
		options.getItems()[0].setSelectedActionName("noActions");
		assert.ok(!model.makeItemsForClose().some(task => task.taskName === "RemoveMergeTemplates"));
		result.singleModeResult.setSelectedResultName("keep");
		assert.ok(!model.makeItemsForClose().some(task => task.taskName === "RemoveMergeTemplates"));
	});
	it("keeps the existing MfD merge action and does not schedule removal", function() {
		assert.strictEqual(getRelevantActions("afd", true, "merge")[0].label, "Add and remove merge templates, tag talk pages");
		assert.strictEqual(getRelevantActions("mfd", true, "merge")[0].label, "Add merge templates, tag talk pages");
		const mfdVenue = Venue.Mfd();
		const mfdDiscussion = new Discussion({venue: mfdVenue, pages: [mw.Title.newFromText("Foo")]});
		const mfdResult = new Result({discussion: mfdDiscussion, type: "close", userIsSysop});
		const mfdOptions = new Options({result: mfdResult, venue: mfdVenue, userIsSysop});
		mfdResult.singleModeResult.setSelectedResultName("merge");
		const mfdTasks = new TaskList({discussion: mfdDiscussion, result: mfdResult, options: mfdOptions}).makeItemsForClose();
		assert.ok(mfdTasks.some(task => task.taskName === "AddMergeTemplates"));
		assert.ok(!mfdTasks.some(task => task.taskName === "RemoveMergeTemplates"));
	});
	// TODO: replace above with more useful tests 
});
