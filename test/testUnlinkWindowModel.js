/* eslint-env node, mocha */
import assert from "assert";
import UnlinkWindowModel from "../xfdcloser-src/Models/UnlinkWindowModel";


describe("UnlinkWindowModel", function() {
	let model;
	describe("Summary", function() {
		beforeEach(function() {
			model = new UnlinkWindowModel({pageName: "Foo"}).summary;
		});
		it("is not valid initially", function() {
			assert.equal(model.summaryIsValid, false);
		});
		it("is valid when a summary value is set", function() {
			model.setSummary("Foo bar");
			assert.equal(model.summaryIsValid, true);
		});
		it("is not valid, with an error message, when summary value is whitespace", function() {
			model.setSummary("    ");
			assert.equal(model.summaryIsValid, false);
			assert.equal(model.summaryErrors.length, 1);
		});
		it("is not valid, with an error message, when summary is cleared", function() {
			model.setSummary("Foo bar");
			model.setSummary("");
			assert.equal(model.summaryIsValid, false);
			assert.equal(model.summaryErrors.length, 1);
		});
		it("becomes valid, and clears error message, when summary is given again", function() {
			model.setSummary("Foo bar");
			model.setSummary("");
			assert.equal(model.summaryIsValid, false);
			assert.equal(model.summaryErrors.length, 1);
			model.setSummary("Baz qux");
			assert.equal(model.summaryIsValid, true);
			assert.equal(model.summaryErrors.length, 0);
		});
	});
	describe("Parsed summary", function() {
		beforeEach(function() {
			model = new UnlinkWindowModel({pageName: "Foo"}).summary;
		});
		it("can be set", function() {
			model.setParsedSummary("Foo");
			assert.equal(model.parsedSummary, "Foo");
		});
		it("can have error set based on error code", function() {
			model.setParseError("somecode");
			assert.deepEqual(model.parseErrors, ["Preview failed: somecode error"]);
		});
		it("can have unknown error set if no error code given", function() {
			model.setParseError();
			assert.equal(model.parseErrors[0], "Preview failed: unknown error");
		});
		it("is cleared if an error is set", function() {
			model.setParsedSummary("Foo");
			assert.equal(model.parsedSummary, "Foo");
			model.setParseError("Bar");
			assert.equal(model.parsedSummary, "");
		});
		it("clears errors when it is set", function() {
			model.setParseError("Bar");
			assert.equal(model.parseErrors.length, 1);
			model.setParsedSummary("Foo");
			assert.equal(model.parseErrors.length, 0);
		});
	});
	describe("Window", function() {
		beforeEach(function() {
			model = new UnlinkWindowModel({pageName: "Foo"});
		});
		it("initially has start action disabled", function() {
			assert.equal(model.actionAbilities.start, false);
		});
		it("is initially in \"initial\" mode with \"summary\" panel", function() {
			assert.equal(model.mode, "initial");
			assert.equal(model.currentPanel, "summary");
		});
		it("sets \"task\" mode and panel when starting the task", function() {
			model.startTask();
			assert.equal(model.mode, "task");
			assert.equal(model.currentPanel, "task");
		});
		it("updates action abilities when starting task", function() {
			model.startTask();
			assert.equal(model.actionAbilities.abort, true);
			assert.equal(model.actionAbilities.close, false);
		});
		it("updates action abilities when task is completed", function() {
			model.startTask();
			model.task.setDone();
			assert.equal(model.actionAbilities.abort, false);
			assert.equal(model.actionAbilities.close, true);
		});
		it("updates action abilities when task is aborted", function() {
			model.startTask();
			model.abortTask();
			assert.equal(model.actionAbilities.abort, false);
			assert.equal(model.actionAbilities.close, true);
		});
		it("can abort task", function() {
			model.startTask();
			model.abortTask();
			assert.equal(model.task.aborted, true);
		});
		it("can not abort task if already completed", function() {
			model.startTask();
			model.task.setDone();
			model.abortTask();
			assert.equal(model.task.aborted, false);
		});
	});
});
