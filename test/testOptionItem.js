/* eslint-env node, mocha */
import assert from "assert";
//import { mw } from "../globals";
import OptionsItem from "../xfdcloser-src/Models/OptionsItem";

describe("OptionsItem", function() {
	let model;
	describe("for keep result (actions without options)", function() {
		beforeEach(function() {
			model = new OptionsItem({
				result: "keep",
				venueType: "tfd",
				userIsSysop: true
			});
		});
		it("is named from result", function() {
			assert.strictEqual(model.result, "keep");
			assert.strictEqual(model.name, "keep");
		});
		it("has label based on result", function() {
			assert.strictEqual(model.label, "\"Keep\" result options");
		});
		it("has two actions", function() {
			assert.strictEqual(model.actions.length, 2);
		});
		it("has the first action selected", function() {
			assert.ok(model.selectedAction);
			assert.strictEqual(model.actions[0].name, "updatePages");
			assert.strictEqual(model.selectedAction.name, "updatePages");
		});
		it("has no options", function() {
			assert.deepStrictEqual(model.options, []);
		});
		it("is valid", function() {
			assert.strictEqual(model.isValid, true);
		});
	});
	describe("for TfD delete result (action with options)", function() {
		beforeEach(function() {
			model = new OptionsItem({
				result: "delete",
				venueType: "tfd",
				userIsSysop: true
			});
		});
		it("is named from result", function() {
			assert.strictEqual(model.result, "delete");
			assert.strictEqual(model.name, "delete");
		});
		it("has label based on result", function() {
			assert.strictEqual(model.label, "\"Delete\" result options");
		});
		it("has three actions", function() {
			assert.strictEqual(model.actions.length, 3);
		});
		it("has the first action initially selected", function() {
			assert.ok(model.selectedAction);
			assert.strictEqual(model.actions[0].name, model.selectedAction.name);
		});
	});
	describe("for TfD delete result (deletePages action)", function() {
		beforeEach(function() {
			model = new OptionsItem({
				result: "delete",
				venueType: "tfd",
				userIsSysop: true
			});
			model.setSelectedActionName("deletePages");
		});
		it("can set action", function() {
			// check that the beforeEach function wored
			assert.strictEqual(model.selectedAction.name, "deletePages");
		});
		it("deletePages action has two options", function() {
			assert.deepStrictEqual(model.options.length, 2);
		});
		it("is valid with options in default values", function() {
			assert.strictEqual(model.isValid, true);
		});
		it("makes values object", function() {
			assert.deepStrictEqual(
				model.values,
				{
					action: "deletePages",
					deleteTalk: true,
					deleteRedir: true,
				}
			);
		});
		it("can set switch-type option values", function() {
			model.setOptionValue("deleteTalk", false);
			assert.deepStrictEqual(
				model.values,
				{
					action: "deletePages",
					deleteTalk: false,
					deleteRedir: true,
				}
			);
			
			model.setOptionValue("deleteTalk", true);
			assert.deepStrictEqual(
				model.values,
				{
					action: "deletePages",
					deleteTalk: true,
					deleteRedir: true,
				}
			);

			model.setOptionValue("deleteRedir", false);
			assert.deepStrictEqual(
				model.values,
				{
					action: "deletePages",
					deleteTalk: true,
					deleteRedir: false,
				}
			);

			model.setOptionValue("deleteTalk", false);
			assert.deepStrictEqual(
				model.values,
				{
					action: "deletePages",
					deleteTalk: false,
					deleteRedir: false,
				}
			);
			
		});
	});
	describe("for TfD delete result (holdingCell action)", function() {
		beforeEach(function() {
			model = new OptionsItem({
				result: "delete",
				venueType: "tfd",
				userIsSysop: true
			});
			model.setSelectedActionName("holdingCell");
		});
		it("can set action", function() {
			// check that the beforeEach function wored
			assert.strictEqual(model.selectedAction.name, "holdingCell");
		});
		it("holdingCell action has one options", function() {
			assert.strictEqual(model.options.length, 1);
		});
		it("is not valid with options in default values", function() {
			assert.strictEqual(model.isValid, false);
		});
		it("makes values object", function() {
			assert.deepStrictEqual(
				model.values,
				{
					action: "holdingCell",
					holdcellSection: undefined
				}
			);
		});
		it("is valid one dropdown option has been set", function() {
			model.setOptionValue("holdcellSection", "convert");
			assert.strictEqual(model.isValid, true);
		});
		it("makes values object", function() {
			assert.deepStrictEqual(
				model.values,
				{
					action: "holdingCell",
					holdcellSection: undefined
				}
			);
		});
		it("can set dropdown-type option values", function() {
			model.setOptionValue("holdcellSection", "convert");
			assert.deepStrictEqual(
				model.values,
				{
					action: "holdingCell",
					holdcellSection: "convert"
				}
			);
			

			model.setOptionValue("holdcellSection", "substitute");
			assert.deepStrictEqual(
				model.values,
				{
					action: "holdingCell",
					holdcellSection: "substitute"
				}
			);

			model.setOptionValue("holdcellSection", "ready");
			assert.deepStrictEqual(
				model.values,
				{
					action: "holdingCell",
					holdcellSection: "ready"
				}
			);
		});
	});
	describe("for TfD redirect result (redirectAndUpdate action)", function() {
		beforeEach(function() {
			model = new OptionsItem({
				result: "redirect",
				venueType: "tfd",
				userIsSysop: true
			});
			model.setSelectedActionName("redirectAndUpdate");
		});
		it("can set action", function() {
			// check that the beforeEach function wored
			assert.strictEqual(model.selectedAction.name, "redirectAndUpdate");
		});
		it("redirectAndUpdate action has one option", function() {
			assert.strictEqual(model.options.length, 1);
		});
		it("is valid with options in default values", function() {
			assert.strictEqual(model.isValid, true);
		});
		it("makes values object", function() {
			assert.deepStrictEqual(
				model.values,
				{
					action: "redirectAndUpdate",
					rcats: []
				}
			);
		});
		it("can set multiselect values", function() {
			model.setOptionValue("rcats", ["Foo"]);
			assert.deepStrictEqual(
				model.values,
				{
					action: "redirectAndUpdate",
					rcats:  ["Foo"]
				}
			);

			model.setOptionValue("rcats", ["Foo", "Bar"]);
			assert.deepStrictEqual(
				model.values,
				{
					action: "redirectAndUpdate",
					rcats:  ["Foo", "Bar"]
				}
			);

			model.setOptionValue("rcats", ["Bar"]);
			assert.deepStrictEqual(
				model.values,
				{
					action: "redirectAndUpdate",
					rcats:  ["Bar"]
				}
			);

			model.setOptionValue("rcats", []);
			assert.deepStrictEqual(
				model.values,
				{
					action: "redirectAndUpdate",
					rcats:  []
				}
			);
		});
	});
	describe(".optionValuesEqual", function() {
		it("compares a boolean correctly", function() {
			assert.strictEqual(OptionsItem.optionValuesEqual(true, true), true);
			assert.strictEqual(OptionsItem.optionValuesEqual(true, false), false);
			assert.strictEqual(OptionsItem.optionValuesEqual(true, "foo"), false);
			assert.strictEqual(OptionsItem.optionValuesEqual(true, ["foo", "bar"]), false);
			assert.strictEqual(OptionsItem.optionValuesEqual(false, ""), false);
			assert.strictEqual(OptionsItem.optionValuesEqual(false, []), false);
			assert.strictEqual(OptionsItem.optionValuesEqual(true, []), false);
		});
		it("compares a string", function() {
			assert.strictEqual(OptionsItem.optionValuesEqual("foo", "foo"), true);
			assert.strictEqual(OptionsItem.optionValuesEqual("foo", "Foo"), false);
			assert.strictEqual(OptionsItem.optionValuesEqual("foo, bar", ["foo", "bar"]), false);
		});
		it("compares a string array", function() {
			assert.strictEqual(OptionsItem.optionValuesEqual(["foo"], ["foo"]), true);
			assert.strictEqual(OptionsItem.optionValuesEqual(["foo"], "foo"), false);
			assert.strictEqual(OptionsItem.optionValuesEqual(["foo", "bar"], ["foo", "bar"]), true);
			assert.strictEqual(OptionsItem.optionValuesEqual(["bar", "foo"], ["foo", "bar"]), false);
			assert.strictEqual(OptionsItem.optionValuesEqual([], []), true);
		});
	});
});