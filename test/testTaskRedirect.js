/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import Redirect from "../xfdcloser-src/Controllers/Tasks/Redirect";
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

describe("Redirect", function() {
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
		result.singleModeResult.setTargetPageName("Qux");
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new Redirect(model, widgets);
	});
	it("makes Redirection object", function() {
		assert.ok(Array.isArray(task.redirections));
		assert.strictEqual(task.redirections.length, 1);
		assert.deepEqual(task.redirections[0], {
			from: "Foobar",
			to: "Qux",
			deleteFirst: false,
			isSoft: false,
			rcats: ["{{R to related topic}}"]
		});
	});
	it("transforms redirection into edit parameters", function() {
		const transformed = task.transform(task.redirections[0]);
		if (transformed.then) {
			throw new Error("returned a promise");
		}
		assert.deepStrictEqual(Object.keys(transformed), ["text", "summary"]);
		assert.strictEqual(transformed.text, "#REDIRECT [[Qux]]\n\n{{Rcat shell|\n{{R to related topic}}\n}}");
	});
	it("transforms redirection without rcats into edit parameters", function() {
		const redirection = task.redirections[0];
		redirection.rcats = null;
		const transformed = task.transform(redirection);
		if (transformed.then) {
			throw new Error("returned a promise");
		}
		assert.deepStrictEqual(Object.keys(transformed), ["text", "summary"]);
		assert.strictEqual(transformed.text, "#REDIRECT [[Qux]]");
		redirection.rcats = [];
		const transformed2 = task.transform(redirection);
		if (transformed2.then) {
			throw new Error("returned a promise");
		}
		assert.deepStrictEqual(Object.keys(transformed2), ["text", "summary"]);
		assert.strictEqual(transformed2.text, "#REDIRECT [[Qux]]");
	});
	it("transforms redirection with multiple rcats into edit parameters", function() {
		const redirection = task.redirections[0];
		redirection.rcats = ["{{R to foo}}", "{{R from bar}}"];
		const transformed = task.transform(redirection);
		if (transformed.then) {
			throw new Error("returned a promise");
		}
		assert.deepStrictEqual(Object.keys(transformed), ["text", "summary"]);
		assert.strictEqual(transformed.text, "#REDIRECT [[Qux]]\n\n{{Rcat shell|\n{{R to foo}}\n{{R from bar}}\n}}");
	});
	it("transforms soft redirection into edit parameters", function() {
		result.singleModeResult.setSoftResult(true);
		const model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		const task = new Redirect(model, widgets);
		const transformed = task.transform(task.redirections[0]);
		if (transformed.then) {
			throw new Error("returned a promise");
		}
		assert.deepStrictEqual(Object.keys(transformed), ["text", "summary"]);
		assert.strictEqual(transformed.text, "{{Soft redirect|Qux}}\n\n{{Rcat shell|\n{{R to related topic}}\n}}");
	});
	it("transforms module redirection into edit parameters", function() {
		discussion.pages = [mw.Title.newFromText("Module:Foobar")];
		mw.Title.exist.set(discussion.pages.map(t => t.getPrefixedDb()), true);
		const result = new Result({
			discussion,
			type: "close",
			userIsSysop: true
		});
		const options = new Options({
			result,
			venue: discussion.venue,
			userIsSysop: true
		});
		result.singleModeResult.setSelectedResultName("redirect");
		result.singleModeResult.setTargetPageName("Module:Qux");
		const model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		const task = new Redirect(model, widgets);
		const transformed = task.transform(task.redirections[0]);
		if (transformed.then) {
			throw new Error("returned a promise");
		}
		assert.deepStrictEqual(Object.keys(transformed), ["text", "summary"]);
		assert.strictEqual(transformed.text, "return require( \"Module:Qux\" )");
	});
	it("rejects transforming module to non-module redirection", function() {
		discussion.pages = [mw.Title.newFromText("Module:Foobar")];
		mw.Title.exist.set(discussion.pages.map(t => t.getPrefixedDb()), true);
		const result = new Result({
			discussion,
			type: "close",
			userIsSysop: true
		});
		const options = new Options({
			result,
			venue: discussion.venue,
			userIsSysop: true
		});
		result.singleModeResult.setSelectedResultName("redirect");
		result.singleModeResult.setTargetPageName("Qux");
		const model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		const task = new Redirect(model, widgets);
		const transformed = task.transform(task.redirections[0]);
		return transformed
			.then(p => { throw new Error("promise resolved", p);})
			.catch(e => assert.strictEqual(e, "targetIsNotModule"));
	});
	it("keeps section when specified in target", function() {
		result.singleModeResult.setTargetPageName("Qux#Bazbar");
		const model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		const task = new Redirect(model, widgets);
		const transformed = task.transform(task.redirections[0]);
		if (transformed.then) {
			throw new Error("returned a promise");
		}
		assert.deepStrictEqual(Object.keys(transformed), ["text", "summary"]);
		assert.strictEqual(transformed.text, "#REDIRECT [[Qux#Bazbar]]\n\n{{Rcat shell|\n{{R to related topic}}\n}}");
	});

});
