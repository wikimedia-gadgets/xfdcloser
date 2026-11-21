/* eslint-env node, mocha */
import assert from "assert";
import { $, mw } from "../globals";
import TaskList from "../xfdcloser-src/Models/TaskList";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
import Venue from "../xfdcloser-src/Venue";
import { getRelevantActions } from "../xfdcloser-src/data";
import RemoveMergeTemplates from "../xfdcloser-src/Controllers/Tasks/RemoveMergeTemplates";

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
	it("schedules removal before adding templates for AFD merge pages", function() {
		result.setMultimode(true);
		result.multimodeResults.getItems()[0].setSelectedResultName("merge");
		result.multimodeResults.getItems()[1].setSelectedResultName("keep");
		const tasks = model.makeItemsForClose();
		const add = tasks.find(task => task.taskName === "AddMergeTemplates");
		const remove = tasks.find(task => task.taskName === "RemoveMergeTemplates");
		assert.ok(add);
		assert.ok(remove);
		assert.deepStrictEqual(remove.pageNames, ["Foo", "Bar"]);
		assert.ok(tasks.indexOf(remove) < tasks.indexOf(add));
		assert.strictEqual(remove.precedingTask.task, tasks[0]);
		assert.strictEqual(add.precedingTask.task, remove);
		assert.strictEqual(add.canProceed(), false);

		tasks[0].trackStep();
		tasks[0].setDone();
		assert.strictEqual(remove.starting, true);
		assert.strictEqual(add.starting, false);

		remove.trackStep();
		remove.setDone();
		assert.strictEqual(add.canProceed(), true);
		assert.strictEqual(add.starting, true);
	});
	it("starts adding after the removal task fails", function() {
		result.singleModeResult.setSelectedResultName("merge");
		const tasks = model.makeItemsForClose();
		const add = tasks.find(task => task.taskName === "AddMergeTemplates");
		const remove = tasks.find(task => task.taskName === "RemoveMergeTemplates");
		tasks[0].trackStep();
		tasks[0].setDone();
		remove.setFailed();
		assert.strictEqual(add.canProceed(), true);
		assert.strictEqual(add.starting, true);
	});
	it("schedules one removal task for merge and redirect actions", function() {
		result.setMultimode(true);
		result.multimodeResults.getItems()[0].setSelectedResultName("merge");
		result.multimodeResults.getItems()[1].setSelectedResultName("redirect");
		const tasks = model.makeItemsForClose();
		const removeTasks = tasks.filter(task => task.taskName === "RemoveMergeTemplates");
		const add = tasks.find(task => task.taskName === "AddMergeTemplates");
		assert.strictEqual(removeTasks.length, 1);
		assert.deepStrictEqual(removeTasks[0].pageNames, ["Foo", "Bar"]);
		assert.strictEqual(add.precedingTask.task, removeTasks[0]);
	});
	it("includes pages whose selected outcome has no automated action", function() {
		result.setMultimode(true);
		result.multimodeResults.getItems()[0].setSelectedResultName("merge");
		result.multimodeResults.getItems()[1].setSelectedResultName("redirect");
		options.getOptions("merge").setSelectedActionName("noActions");
		const tasks = model.makeItemsForClose();
		assert.deepStrictEqual(tasks.find(task => task.taskName === "RemoveMergeTemplates").pageNames, ["Foo", "Bar"]);
		assert.ok(!tasks.some(task => task.taskName === "AddMergeTemplates"));
	});
	it("schedules removal for an AFD redirect without scheduling merge addition", function() {
		result.singleModeResult.setSelectedResultName("redirect");
		const tasks = model.makeItemsForClose();
		assert.deepStrictEqual(tasks.find(task => task.taskName === "RemoveMergeTemplates").pageNames, ["Foo", "Bar"]);
		assert.ok(!tasks.some(task => task.taskName === "AddMergeTemplates"));
		options.getItems()[0].setSelectedActionName("noActions");
		assert.ok(model.makeItemsForClose().some(task => task.taskName === "RemoveMergeTemplates"));
	});
	it("schedules removal for no automated actions and non-merge results", function() {
		result.singleModeResult.setSelectedResultName("merge");
		options.getItems()[0].setSelectedActionName("noActions");
		assert.ok(model.makeItemsForClose().some(task => task.taskName === "RemoveMergeTemplates"));
		result.singleModeResult.setSelectedResultName("keep");
		assert.deepStrictEqual(model.makeItemsForClose().find(task => task.taskName === "RemoveMergeTemplates").pageNames, ["Foo", "Bar"]);
	});
	it("marks removal as skipped rather than failed for a keep outcome", function() {
		result.singleModeResult.setSelectedResultName("keep");
		const remove = model.makeItemsForClose().find(task => task.taskName === "RemoveMergeTemplates");
		const controller = Object.create(RemoveMergeTemplates.prototype);
		controller.model = remove;
		controller.api = {queryWithContinue: () => $.Deferred().resolve({backlinks: []})};
		return controller.doTask().then(() => {
			remove.setDone();
			assert.strictEqual(remove.done, true);
			assert.strictEqual(remove.failed, false);
			assert.strictEqual(remove.steps.skipped, 1);
		});
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
});
