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
	loadModel("UnlinkSummaryModel", "./xfdcloser-src/Views/UnlinkSummary/UnlinkSummaryModel.js"),
	loadModel("UnlinkTaskModel", "./xfdcloser-src/Views/UnlinkTask/UnlinkTaskModel.js"),
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
		assert.ok(models.UnlinkSummaryModel);
		assert.ok(models.UnlinkTaskModel);
	});
});

describe("UnlinkSummaryModel", function() {
	let model;
	beforeEach(function() {
		model = new models.UnlinkSummaryModel({
			advert: "(advert)",
			api: { // Mock Api
				get: request => new Promise(
					resolve => resolve({
						parse: {
							parsedsummary: request.summary
								.replace(/\[\[(.+)\|(.+)]]/, "<a href=\"/wiki/$1\">$2</a>")
								.replace(/\[\[(.+)]]/, "<a href=\"/wiki/$1\">$1</a>")
						}
					})
				)
			},
			delay: 200
		});
	});
	
	it("is not valid initially", function() {
		assert.equal(model.isValid, false);
	});

	it("becomes valid when given a summary", function() {
		model.setSummaryValue("Foo bar");
		assert.equal(model.isValid, true);
	});

	it("becomes invalid with an error message when summary is cleared", function() {
		model.setSummaryValue("Foo bar");
		model.setSummaryValue("");
		assert.equal(model.isValid, false);
		assert.equal(model.summaryErrors.length, 1);
	});

	it("becomes valid and clears error message when summary is given again", function() {
		model.setSummaryValue("Foo bar");
		model.setSummaryValue("");
		assert.equal(model.isValid, false);
		assert.equal(model.summaryErrors.length, 1);
		model.setSummaryValue("Baz qux");
		assert.equal(model.isValid, true);
		assert.equal(model.summaryErrors.length, 0);
	});

	it("sets parsed summary after delay", function(done) {
		assert.equal(model.parsedSummary, "");
		model.setSummaryValue("Foo bar");
		setTimeout(function() {
			assert.equal(model.parsedSummary, "Removing link(s): Foo bar (advert)");
			done();
		}, 250);
	});

	it("does not set initially parsed summary if summary changes during delay", function(done) {
		assert.equal(model.parsedSummary, "");
		model.setSummaryValue("Foo bar");
		setTimeout(function() {
			model.setSummaryValue("Qux");
		}, 100);
		setTimeout(function() {
			assert.equal(model.parsedSummary, "");
		}, 250);
		setTimeout(function() {
			assert.equal(model.parsedSummary, "Removing link(s): Qux (advert)");
			done();
		}, 350);

	});

	it("does not set parsed summary if summary changes to invalid during delay", function(done) {
		assert.equal(model.parsedSummary, "");
		model.setSummaryValue("Foo bar");
		setTimeout(function() {
			model.setSummaryValue("");
		}, 100);
		setTimeout(function() {
			assert.equal(model.parsedSummary, "");
			done();
		}, 350);
	});
});

describe("UnlinkTaskModel", function() {
	let model;
	beforeEach(function() {
		model = new models.UnlinkTaskModel({pageName: "Foo"});
	});
	it("initially has not summary", function() {
		assert.equal(model.summary, "");
	});
	it("initially can update the summary", function() {
		model.setSummary("Foo bar");
		assert.equal(model.summary, "Foo bar");
	});
	it("initally is not started, aborted, or completed", function() {
		assert.equal(model.taskStarted, false);
		assert.equal(model.taskAborted, false);
		assert.equal(model.taskCompleted, false);
	});
	it("can be started", function() {
		model.setTaskStarted();
		assert.equal(model.taskStarted, true);
		assert.equal(model.taskAborted, false);
		assert.equal(model.taskCompleted, false);
	});
	it("can be started then completed", function() {
		model.setTaskStarted();
		model.setTaskCompleted();
		assert.equal(model.taskStarted, true);
		assert.equal(model.taskAborted, false);
		assert.equal(model.taskCompleted, true);
	});
	it("can be started then aborted", function() {
		model.setTaskStarted();
		model.setTaskAborted();
		assert.equal(model.taskStarted, true);
		assert.equal(model.taskAborted, true);
		assert.equal(model.taskCompleted, false);
	});
	it("can be aborted without being started", function() {
		model.setTaskAborted();
		assert.equal(model.taskStarted, false);
		assert.equal(model.taskAborted, true);
		assert.equal(model.taskCompleted, false);
	});
	// TODO
	it.skip("cannot be completed if not started", function() {
		model.setTaskCompleted();
		assert.equal(model.taskStarted, false);
		assert.equal(model.taskAborted, false);
		assert.equal(model.taskCompleted, false);
	});
	it.skip("cannot be aborted once completed", function() {
		model.setTaskStarted();
		model.setTaskCompleted();
		model.setTaskAborted();
		assert.equal(model.taskStarted, true);
		assert.equal(model.taskAborted, false);
		assert.equal(model.taskCompleted, false);
	});
});