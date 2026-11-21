/* eslint-env node, mocha */
import assert from "assert";
import { $ } from "../globals";
import API from "../xfdcloser-src/api";
import RemoveMergeTemplates from "../xfdcloser-src/Controllers/Tasks/RemoveMergeTemplates";

const fixtures = require("./fixtures/removeMergeTemplates.json");

// Instantiate without the full constructor since removeMergeTemplatesFromWikicode only uses prototype methods
const task = Object.create(RemoveMergeTemplates.prototype);

describe("RemoveMergeTemplates.removeMergeTemplatesFromWikicode", function() {
	for (const [testName, testCase] of Object.entries(fixtures)) {
		it(testName, function() {
			const { oldWikicode, sourcePage, nominationName, expectedWikicode } = testCase;
			assert.strictEqual(
				task.removeMergeTemplatesFromWikicode(oldWikicode, sourcePage, nominationName),
				expectedWikicode
			);
		});
	}
});

describe("RemoveMergeTemplates.doTask", function() {
	let model, controller;
	beforeEach(function() {
		model = {
			aborted: false,
			discussion: {
				discussionPageName: "Wikipedia:Articles for deletion/Nomination",
				redirects: {resolveOne: pageName => pageName},
				pages: ["Foo", "Bar", "Missing"]
			},
			steps: { completed: 0, skipped: 0, failed: 0 },
			errors: [],
			warnings: [],
			options: {
				getOptionValues(result) {
					return {action: result === "merge" ? "mergeAndUpdate" : "redirectAndUpdate"};
				}
			},
			connect() {},
			setName(name) { this.name = name; },
			getPageResults() {
				return [
					{pageName: "Foo", selectedResultName: "merge", getFormattedTarget: () => "Target"},
					{pageName: "Bar", selectedResultName: "merge", getFormattedTarget: () => "Target"},
					{pageName: "Missing", selectedResultName: "merge", getFormattedTarget: () => "Missing target"}
				];
			},
			setTotalSteps(total) { this.total = total; },
			setDoing() { this.doing = true; },
			getEditSummary() { return "Closing discussion"; },
			trackStep(type) { this.steps[type || "completed"]++; },
			addError(error) { this.errors.push(error); },
			addWarning(warning) { this.warnings.push(warning); },
			setFailed() { this.failed = true; }
		};
		controller = new RemoveMergeTemplates(model, {});
		controller.api = Object.create(API);
	});

	it("fetches each target, removes its merge templates, retries conflicts, and reports missing pages", function() {
		let targetReads = 0;
		const edits = [];
		const getPage = title => {
			if ( title === "Missing target" ) return {title, missing: true};
			const content = "{{Being merged from|Foo|discussion=Wikipedia:Articles for deletion/Nomination}}\n" +
				"{{Being merged from|Bar|discussion=Wikipedia:Articles for deletion/Nomination}}\n" +
				`${++targetReads === 1 ? "Original" : "Updated"}`;
			return {title, revisions: [{timestamp: `revision${targetReads}`, slots: {main: {content}}}]};
		};
		controller.api.get = query => {
			const titles = Array.isArray(query.titles) ? query.titles : [query.titles];
			return $.Deferred().resolve({curtimestamp: "start", query: {pages: titles.map(getPage)}});
		};
		controller.api.postWithToken = (token, query) => {
			assert.strictEqual(token, "csrf");
			edits.push(query);
			if ( query.title === "Target" && edits.filter(edit => edit.title === "Target").length === 1 ) {
				return $.Deferred().reject("editconflict");
			}
			return $.Deferred().resolve({edit: {result: "Success"}});
		};
		return controller.doTask().then(() => {
			assert.strictEqual(model.name, "Removing merge templates");
			assert.strictEqual(model.total, 2);
			assert.strictEqual(model.doing, true);
			assert.deepStrictEqual(model.steps, {completed: 1, skipped: 0, failed: 1});
			assert.ok(model.errors[0].includes("Missing target"));
			const targetEdits = edits.filter(edit => edit.title === "Target");
			assert.strictEqual(targetEdits.length, 2);
			assert.strictEqual(targetEdits[1].text, "Updated");
			assert.strictEqual(targetEdits[1].basetimestamp, "revision2");
			assert.strictEqual(targetEdits[1].summary, "Closing discussion");
			assert.strictEqual(targetEdits[1].tags, "XFDcloser");
			assert.ok(!edits.some(edit => ["Foo", "Bar", "Missing"].includes(edit.title)));
		});
	});

	it("removes templates for merge and redirect sources on their targets only", function() {
		model.getPageResults = () => [
			{pageName: "Foo", selectedResultName: "merge", getFormattedTarget: () => "Shared target"},
			{pageName: "Bar", selectedResultName: "redirect", getFormattedTarget: () => "Shared_target"},
			{pageName: "Baz", selectedResultName: "redirect", getFormattedTarget: () => "Other target"},
			{pageName: "Ignored", selectedResultName: "keep", getFormattedTarget: () => {
				throw new Error("Unrelated outcome should not have a target");
			}}
		];
		controller.api.editWithRetry = (titles, params, transform) => {
			assert.deepStrictEqual(titles, ["Shared target", "Other target"]);
			assert.strictEqual(transform({
				content: "{{Merge from|Foo}}\n{{Merge from|Bar}}\n{{Merge from|Ignored}}\nText"
			}).text, "{{Merge from|Ignored}}\nText");
			assert.strictEqual(transform({content: "{{Merge from|Baz}}\nText"}).text, "Text");
			return $.Deferred().resolve();
		};
		return controller.doTask().then(() => assert.strictEqual(model.total, 2));
	});

	it("skips when no relevant outcomes are found", function() {
		model.getPageResults = () => [{pageName: "Foo", selectedResultName: "keep"}];
		controller.api.editWithRetry = () => { throw new Error("No pages should be edited"); };
		return controller.doTask().then(() => {
			assert.strictEqual(model.total, 1);
			assert.deepStrictEqual(model.steps, {completed: 0, skipped: 1, failed: 0});
		});
	});

	it("does not edit targets when automated actions are disabled", function() {
		model.options.getOptionValues = () => ({action: "noActions"});
		controller.api.editWithRetry = () => { throw new Error("No pages should be edited"); };
		return controller.doTask().then(() => {
			assert.deepStrictEqual(model.steps, {completed: 0, skipped: 1, failed: 0});
		});
	});

	it("excludes disabled outcomes while processing enabled outcomes", function() {
		model.getPageResults = () => [
			{pageName: "Foo", selectedResultName: "merge", getFormattedTarget: () => { throw new Error("Disabled target accessed"); }},
			{pageName: "Bar", selectedResultName: "redirect", getFormattedTarget: () => "Target"}
		];
		model.options.getOptionValues = result => ({action: result === "merge" ? "noActions" : "redirectAndUpdate"});
		controller.api.editWithRetry = titles => {
			assert.deepStrictEqual(titles, ["Target"]);
			return $.Deferred().resolve();
		};
		return controller.doTask();
	});

	it("skips unchanged pages without saving", function() {
		model.getPageResults = () => [{pageName: "Foo", selectedResultName: "merge", getFormattedTarget: () => "Foo"}];
		controller.api.get = () => $.Deferred().resolve({
			curtimestamp: "start",
			query: {pages: [{title: "Foo", revisions: [{timestamp: "revision", slots: {main: {content: "No templates"}}}]}]}
		});
		controller.api.postWithToken = () => { throw new Error("Unchanged page should not be saved"); };
		return controller.doTask().then(() => {
			assert.deepStrictEqual(model.steps, {completed: 0, skipped: 1, failed: 0});
			assert.ok(model.warnings[0].includes("Foo"));
		});
	});

	it("reports read failures", function() {
		model.getPageResults = () => [{pageName: "Foo", selectedResultName: "merge", getFormattedTarget: () => "Foo"}];
		controller.api.get = () => $.Deferred().reject("http", {message: "Read failed"});
		controller.logError = () => {};
		return controller.doTask().then(
			() => { throw new Error("Read failure should reject"); },
			() => {
				assert.strictEqual(model.failed, true);
				assert.ok(model.errors[0].includes("Could not read contents"));
			}
		);
	});

	it("does not save after the task is aborted", function() {
		model.aborted = true;
		model.getPageResults = () => [{pageName: "Foo", selectedResultName: "merge", getFormattedTarget: () => "Foo"}];
		controller.api.get = () => $.Deferred().resolve({
			curtimestamp: "start",
			query: {pages: [{title: "Foo", revisions: [{timestamp: "revision", slots: {main: {content: "{{Merge|Foo}}"}}}]}]}
		});
		controller.api.postWithToken = () => { throw new Error("Aborted task should not save"); };
		return controller.doTask().then(() => {
			assert.deepStrictEqual(model.steps, {completed: 0, skipped: 0, failed: 1});
		});
	});
});
