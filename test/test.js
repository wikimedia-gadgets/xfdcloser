/* eslint-env node, mocha */
import assert from "assert";
import fs from "fs";

// jQuery setup
import { JSDOM } from "jsdom";
const { window } = new JSDOM( "" );
import jQueryInstance from "jquery"; 
global.$ = jQueryInstance( window );

// OOjs setup
import OO from "../node_modules/oojs/dist/oojs";
global.OO = OO;

// Models setup
const models = {};
const loadModel = (name, path) => new Promise((resolve,reject) =>
	fs.readFile(path, "utf8", function (err,data) {
		if (err) reject(err);
		data = `(function(models) {
			${data.replace(/^export.*$/gm, "")}
			models["${name}"] = ${name};
		})(models)`;
		eval(data);
		resolve();
	})
);
const setupModels = Promise.all([
	loadModel("UnlinkWindowModel", "./xfdcloser-src/Windows/Unlink/UnlinkWindowModel.js"),
	// TODO: more model tests
]);

// Run Mocha after setup is complete
setupModels.then(run);

describe("Setup", function() {
	it("has loaded jQuery", function() {
		assert.ok($);
		assert.ok($.Deferred);
	});
	it("has loaded OOjs", function() {
		assert.ok(OO);
	});
	it("has loaded the models", function() {
		["UnlinkWindowModel" /* TODO: Other models */].forEach(modelName => {
			assert.ok(models[modelName]);
		});
	});
});

describe("UnlinkWindowModel", function() {
	let model;
	const resetModel = function() {
		model = new models.UnlinkWindowModel({pageName: "Foo"});
	};
	describe("Summary", function() {
		beforeEach(resetModel);
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
		beforeEach(resetModel);
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
		beforeEach(resetModel);
		it("initially has start action disabled", function() {
			assert.equal(model.actionAbilities.start, false);
		});
		it("is initially in \"initial\" view and \"summary\" mode", function() {
			assert.equal(model.mode, "initial");
			assert.equal(model.viewName, "summary");
		});
		it("sets \"task\" view and mode, and startRequested:true, when starting the task", function() {
			model.startTask();
			assert.equal(model.mode, "task");
			assert.equal(model.viewName, "task");
			assert.equal(model.startRequested, true);
		});
		it("does not start task again when already started", function() {
			model.startTask();	
			assert.equal(model.mode, "task");
			assert.equal(model.viewName, "task");
			assert.equal(model.startRequested, true);
			// Adjust values so can check they aren't changed when startTask is called again
			model.mode = "foo";
			model.viewName = "bar";
			model.startRequested = "truthy";
			model.startTask();	
			assert.equal(model.mode, "foo");
			assert.equal(model.viewName, "bar");
			assert.equal(model.startRequested, "truthy");
		});
		it("does not start task when already aborted", function() {
			model.abortTask();
			model.startTask();
			assert.equal(model.aborted, true);
			assert.equal(model.startRequested, false);
		});
		it("updates action abilities when starting task", function() {
			model.startTask();
			assert.equal(model.actionAbilities.abort, true);
			assert.equal(model.actionAbilities.close, false);
		});
		it("updates action abilities when task is completed", function() {
			model.startTask();
			model.setCompleted();
			assert.equal(model.actionAbilities.abort, false);
			assert.equal(model.actionAbilities.close, true);
		});
		it("updates action abilities when task is aborted", function() {
			model.startTask();
			model.abortTask();
			assert.equal(model.actionAbilities.abort, false);
			assert.equal(model.actionAbilities.close, true);
		});
		it("can abort task when already started", function() {
			model.startTask();
			model.abortTask();
			assert.equal(model.aborted, true);
		});
		it("can abort task when not started", function() {
			model.abortTask();
			assert.equal(model.aborted, true);
		});
		it("can not abort task if already completed", function() {
			model.startTask();
			model.setCompleted();
			model.abortTask();
			assert.equal(model.aborted, false);
		});
	});
});