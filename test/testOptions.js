/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import Options from "../xfdcloser-src/Models/Options";
import Result from "../xfdcloser-src/Models/Result";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";

describe.skip("Options", function() {
	let model;
	describe.skip("Initialising", function() {
		const resetModel = function() {
			model = new Options();
		};
		beforeEach(resetModel);
		it("initially has no result options", function() {
			assert.strictEqual(model.resultOptions.length, 0);
		});
		it("can be initialised", function() {
			model.initialiseResultOptions([{result: "keep", actions:["updatePages", "noActions"]}]);
			assert.strictEqual(model.resultOptions.length, 1, "one resultOption object");
			assert.deepStrictEqual(model.resultOptions[0], {
				result: "keep",
				label: "\"Keep\" options",
				actions: [
					{
						label: "Remove nomination templates, tag talk pages",
						data: {
							name: "updatePages"
						},
					},
					{
						label: "No automated actions",
						data: {name: "noActions"},
					}
				],
				selectedActionIndex: 0,
				options: []
			});
		});
		it("can be re-initialised with different result", function() {
			model.initialiseResultOptions([{result: "keep", actions:["updatePages", "noActions"]}]);
			model.initialiseResultOptions([{result: "merge", actions:["mergeAndUpdate", "noActions"]}]);
			assert.strictEqual(model.resultOptions.length, 1, "one resultOption object");
			assert.deepStrictEqual(model.resultOptions[0], {
				result: "merge",
				label: "\"Merge\" options",
				actions: [
					{
						label: "Add merge templates, tag talk pages",
						data: {
							name: "mergeAndUpdate"
						},
					},
					{
						label: "No automated actions",
						data: {name: "noActions"},
					}
				],
				selectedActionIndex: 0,
				options: []
			});
		});
		it("can be re-initialised with the same result and not loose changes", function() {
			model.initialiseResultOptions([{result: "keep", actions:["updatePages", "noActions"]}]);
			model.resultOptions[0].selectedActionIndex = 1;
			model.initialiseResultOptions([{result: "keep", actions:["updatePages", "noActions"]}]);
			assert.strictEqual(model.resultOptions.length, 1, "one resultOption object");
			assert.deepStrictEqual(model.resultOptions[0], {
				result: "keep",
				label: "\"Keep\" options",
				actions: [
					{
						label: "Remove nomination templates, tag talk pages",
						data: {
							name: "updatePages"
						},
					},
					{
						label: "No automated actions",
						data: {name: "noActions"},
					}
				],
				selectedActionIndex: 1,
				options: []
			});
		});
		it("can be initialised with multiple results", function() {
			model.initialiseResultOptions([
				{result: "keep", actions:["updatePages", "noActions"]},
				{result: "merge", actions:["mergeAndUpdate", "noActions"]}
			]);
			assert.strictEqual(model.resultOptions.length, 2, "two resultOption objects");
			assert.deepStrictEqual(model.resultOptions[0], {
				result: "keep",
				label: "\"Keep\" options",
				actions: [
					{
						label: "Remove nomination templates, tag talk pages",
						data: {
							name: "updatePages"
						},
					},
					{
						label: "No automated actions",
						data: {name: "noActions"},
					}
				],
				selectedActionIndex: 0,
				options: []
			});
			assert.deepStrictEqual(model.resultOptions[1], {
				result: "merge",
				label: "\"Merge\" options",
				actions: [
					{
						label: "Add merge templates, tag talk pages",
						data: {
							name: "mergeAndUpdate"
						},
					},
					{
						label: "No automated actions",
						data: {name: "noActions"},
					}
				],
				selectedActionIndex: 0,
				options: []
			});
		});
		
		it("can be re-initialised with a second result and not loose changes", function() {
			model.initialiseResultOptions([{result: "keep", actions:["updatePages", "noActions"]}]);
			model.resultOptions[0].selectedActionIndex = 1;
			model.initialiseResultOptions([
				{result: "keep", actions:["updatePages", "noActions"]},
				{result: "merge", actions:["mergeAndUpdate", "noActions"]}
			]);

			assert.strictEqual(model.resultOptions.length, 2, "two resultOption objects");
			assert.deepStrictEqual(model.resultOptions[0], {
				result: "keep",
				label: "\"Keep\" options",
				actions: [
					{
						label: "Remove nomination templates, tag talk pages",
						data: {
							name: "updatePages"
						},
					},
					{
						label: "No automated actions",
						data: {name: "noActions"},
					}
				],
				selectedActionIndex: 1,
				options: []
			});
			assert.deepStrictEqual(model.resultOptions[1], {
				result: "merge",
				label: "\"Merge\" options",
				actions: [
					{
						label: "Add merge templates, tag talk pages",
						data: {
							name: "mergeAndUpdate"
						},
					},
					{
						label: "No automated actions",
						data: {name: "noActions"},
					}
				],
				selectedActionIndex: 0,
				options: []
			});
		});
	});
	describe("Initialised", function() {
		beforeEach(function() {
			const venue = Venue.Tfd();
			const result = new Result({
				discussion: new Discussion({
					id: "123",
					venue,
					pages: [ mw.Title.newFromText("Foo"), mw.Title.newFromText("Bar"), mw.Title.newFromText("Qux") ],
					discussionPageName: "Wikipedia:Templates for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: true
			});
			model = new Options({
				result, venue, userIsSysop:true
			});
			result.setMultimode(true);
			result.setResultSummary("summary");
			result.updateMultimodeResult({
				pageName: "Foo",
				selectedResultIndex: 0 /* keep */
			});
			result.updateMultimodeResult({
				pageName: "Bar",
				selectedResultIndex: 2 /* redirect */
			});
			result.updateMultimodeResult({
				pageName: "Bar",
				targetPageName: "Pub"
			});
			result.updateMultimodeResult({
				pageName: "Qux",
				selectedResultIndex: 1 /* delete */
			});
			//model.onResultUpdate();
		});
		it("can set action", function() {
			assert.strictEqual(model.resultOptions[0] && model.resultOptions[0].selectedActionIndex, 0);
			model.setActionIndex("keep", 1);
			assert.strictEqual(model.resultOptions[0] && model.resultOptions[0].selectedActionIndex, 1);
			
			assert.strictEqual(model.resultOptions[2] && model.resultOptions[2].selectedActionIndex, 0);
			model.setActionIndex("delete", 2);
			assert.strictEqual(model.resultOptions[2] && model.resultOptions[2].selectedActionIndex, 2);
			model.setActionIndex("delete", 1);
			assert.strictEqual(model.resultOptions[2] && model.resultOptions[2].selectedActionIndex, 1);
			model.setActionIndex("delete", 0);
			assert.strictEqual(model.resultOptions[2] && model.resultOptions[2].selectedActionIndex, 0);

			assert.throws(() => { model.setActionIndex("notOneOfTheResults", 1); });
		});
		it("can set options", function() {
			assert.strictEqual(model.resultOptions[2].options.length, 3, "0: delete has three options");
			assert.strictEqual(model.resultOptions[2].options[0].value, true, "0: first toggle is on");
			assert.strictEqual(model.resultOptions[2].options[1].value, true, "0: second toggle is on");
			assert.strictEqual(model.resultOptions[2].options[2].selectedItemIndex, -1, "0: menu has nothing selected");

			model.setOptions("delete",  [
				{
					name: "deleteTalk",
					prop: "value",
					val: true
				}, {
					name: "deleteRedir",
					prop: "value",
					val: false,
				}, {
					name: "holdcellSection",
					prop: "selectedItemIndex",
					val: -1
				}
			]);
			assert.strictEqual(model.resultOptions[2].options[0].value, true, "1: first toggle is on");
			assert.strictEqual(model.resultOptions[2].options[1].value, false, "1: second toggle is off");
			assert.strictEqual(model.resultOptions[2].options[2].selectedItemIndex, -1, "1: menu has nothing selected");
			
			model.setOptions("delete",  [
				{
					name: "deleteTalk",
					prop: "value",
					val: true
				}, {
					name: "deleteRedir",
					prop: "value",
					val: false,
				}, {
					name: "holdcellSection",
					prop: "selectedItemIndex",
					val: 1
				}
			]);
			assert.strictEqual(model.resultOptions[2].options[0].value, true, "2: first toggle is on");
			assert.strictEqual(model.resultOptions[2].options[1].value, false, "2: second toggle is off");
			assert.strictEqual(model.resultOptions[2].options[2].selectedItemIndex, 1, "2: menu has index 1 selected");

			model.setOptions("delete",  [
				{
					name: "deleteTalk",
					prop: "value",
					val: false
				}, {
					name: "deleteRedir",
					prop: "value",
					val: false,
				}, {
					name: "holdcellSection",
					prop: "selectedItemIndex",
					val: 1
				}
			]);
			assert.strictEqual(model.resultOptions[2].options[0].value, false);
			assert.strictEqual(model.resultOptions[2].options[1].value, false);
			assert.strictEqual(model.resultOptions[2].options[2].selectedItemIndex, 1);

			let returnVal = model.setOptions("delete",  [
				{
					name: "deleteTalk",
					prop: "value",
					val: false
				}, {
					name: "deleteRedir",
					prop: "value",
					val: false,
				}, {
					name: "holdcellSection",
					prop: "selectedItemIndex",
					val: 1
				}
			]);
			assert.strictEqual(returnVal, false);

			assert.strictEqual(model.resultOptions[1].options.length, 1);
			assert.strictEqual(model.resultOptions[1].options[0].selectedItemsData.length, 0);

			model.setOptions("redirect", [
				{
					name: "rcats",
					prop: "selectedItemsData",
					val: ["foo"]
				}
			]);
			assert.deepStrictEqual(model.resultOptions[1].options[0].selectedItemsData, ["foo"]);

			model.setOptions("redirect", [
				{
					name: "rcats",
					prop: "selectedItemsData",
					val: ["foo", "bar"]
				}
			]);
			assert.deepStrictEqual(model.resultOptions[1].options[0].selectedItemsData, ["foo", "bar"]);

			model.setOptions("redirect", [
				{
					name: "rcats",
					prop: "selectedItemsData",
					val: []
				}
			]);
			assert.deepStrictEqual(model.resultOptions[1].options[0].selectedItemsData, []);
		});
		it("gets option values", function() {
			assert.deepStrictEqual(model.getOptionValues("keep"), {
				action: "updatePages",
				result: "keep"
			}, "action without options");

			assert.deepStrictEqual(model.getOptionValues("delete"), {
				action: "deletePages",
				result: "delete",
				deleteTalk: true,
				deleteRedir: true
			}, "action with toggle options (both on)");

			model.setOptions("delete",  [
				{
					name: "deleteTalk",
					prop: "value",
					val: false
				}
			]);
			assert.deepStrictEqual(model.getOptionValues("delete"), {
				action: "deletePages",
				result: "delete",
				deleteTalk: false,
				deleteRedir: true
			}, "action with toggle options (one off)");

			assert.ok(model.getOptionValues("redirect"), {
				action: "redirectAndUpdate",
				result: "redirect",
				rcats: ""
			}, "action with multiselect option");

			model.setActionIndex("delete", 2);
			assert.deepStrictEqual(model.getOptionValues("delete"), {
				action: "noActions",
				result: "delete",
			}, "action changed");

			model.setActionIndex("delete", 1);
			assert.deepStrictEqual(model.getOptionValues("delete"), {
				action: "holdingCell",
				result: "delete",
				holdcellSection: null
			}, "dropdown option not selected");

			model.setOptions("delete",  [
				{
					name: "holdcellSection",
					prop: "selectedItemIndex",
					val: 2
				}
			]);
			assert.deepStrictEqual(model.getOptionValues("delete"), {
				action: "holdingCell",
				result: "delete",
				holdcellSection: "substitute"
			}, "dropdown option selected");
		});
		it("validates a result option", function() {
			assert.strictEqual(
				model.resultOptionIsValid( model.resultOptions[0] ), true,
				"action without options"
			);

			assert.strictEqual(
				model.resultOptionIsValid( model.resultOptions[2] ), true,
				"action with toggle options (both on)"
			);

			model.setOptions("delete",  [
				{
					name: "deleteTalk",
					prop: "value",
					val: false
				}
			]);
			assert.strictEqual(
				model.resultOptionIsValid( model.resultOptions[2] ), true,
				"action with toggle options (one off)"
			);

			model.setActionIndex("delete", 1);
			assert.deepStrictEqual(model.getOptionValues("delete"), {
				action: "holdingCell",
				result: "delete",
				holdcellSection: null
			}, "dropdown option is not selected");
			assert.strictEqual(
				model.resultOptionIsValid( model.resultOptions[2] ), false,
				"action with dropdown option not selected"
			);

			model.setOptions("delete",  [
				{
					name: "holdcellSection",
					prop: "selectedItemIndex",
					val: 2
				}
			]);
			assert.strictEqual(
				model.resultOptionIsValid( model.resultOptions[2] ), true,
				"action with dropdown option selected"
			);
			
			assert.strictEqual(
				model.resultOptionIsValid( model.resultOptions[1] ), true,
				"action with multiselect (no selections)"
			);

			model.setOptions("redirect", [
				{
					name: "rcats",
					prop: "selectedItemsData",
					val: ["foo"]
				}
			]);
			assert.strictEqual(
				model.resultOptionIsValid( model.resultOptions[1] ), true,
				"action with multiselect (one selection)"
			);

			model.setOptions("redirect", [
				{
					name: "rcats",
					prop: "selectedItemsData",
					val: ["foo", "bar"]
				}
			]);
			assert.strictEqual(
				model.resultOptionIsValid( model.resultOptions[1] ), true,
				"action with multiselect (multiple selections)"
			);
		});
		it("validates all result options", function() {
			assert.strictEqual(model.isValid, true, "Valid if invalid option is not for the selected action");

			model.setActionIndex("delete", 1);
			assert.strictEqual(model.isValid, false, "Invalid if invalid option is for the selected action");

			model.setOptions("delete",  [
				{
					name: "holdcellSection",
					prop: "selectedItemIndex",
					val: 2
				}
			]);
			assert.strictEqual(model.isValid, true, "Valid if all options are valid");
		});
	});
});