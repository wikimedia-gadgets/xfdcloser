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
				pages: ["Foo", "Bar", "Missing"]
			},
			steps: { completed: 0, skipped: 0, failed: 0 },
			errors: [],
			warnings: [],
			connect() {},
			setName(name) { this.name = name; },
			getResolvedPageNames() { return ["Foo", "Foo", "Bar", "Missing"]; },
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

	it("fetches each source, retries conflicts using fresh content, and reports missing pages", function() {
		let fooReads = 0;
		const edits = [];
		const getPage = title => {
			if ( title === "Missing" ) return {title, missing: true};
			const content = title === "Foo"
				? `{{Merge|Foo}}\n{{Afd-merge to|Target}}\n${++fooReads === 1 ? "Original" : "Updated"}`
				: "{{Merge|Wikipedia:Articles for deletion/Nomination}}\nBar";
			return {title, revisions: [{timestamp: `revision${fooReads}`, slots: {main: {content}}}]};
		};
		controller.api.get = query => {
			const titles = Array.isArray(query.titles) ? query.titles : [query.titles];
			return $.Deferred().resolve({curtimestamp: "start", query: {pages: titles.map(getPage)}});
		};
		controller.api.postWithToken = (token, query) => {
			assert.strictEqual(token, "csrf");
			edits.push(query);
			if ( query.title === "Foo" && edits.filter(edit => edit.title === "Foo").length === 1 ) {
				return $.Deferred().reject("editconflict");
			}
			return $.Deferred().resolve({edit: {result: "Success"}});
		};
		return controller.doTask().then(() => {
			assert.strictEqual(model.name, "Remove merge templates");
			assert.strictEqual(model.total, 3);
			assert.strictEqual(model.doing, true);
			assert.deepStrictEqual(model.steps, {completed: 2, skipped: 0, failed: 1});
			assert.ok(model.errors[0].includes("Missing"));
			const fooEdits = edits.filter(edit => edit.title === "Foo");
			assert.strictEqual(fooEdits.length, 2);
			assert.strictEqual(fooEdits[1].text, "{{Afd-merge to|Target}}\nUpdated");
			assert.strictEqual(fooEdits[1].basetimestamp, "revision2");
			assert.strictEqual(fooEdits[1].summary, "Closing discussion");
			assert.strictEqual(edits.find(edit => edit.title === "Bar").text, "Bar");
		});
	});

	it("skips unchanged pages without saving", function() {
		model.getResolvedPageNames = () => ["Foo"];
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
		model.getResolvedPageNames = () => ["Foo"];
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
		model.getResolvedPageNames = () => ["Foo"];
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
