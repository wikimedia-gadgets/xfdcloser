/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import Options from "../xfdcloser-src/Models/Options";
import Result from "../xfdcloser-src/Models/Result";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import { defaultPrefValues } from "../xfdcloser-src/data";

describe("Options", function() {
	let model, discussion, result, venue, userIsSysop;
	describe("list", function() {
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
			model = new Options({
				result,
				venue,
				userIsSysop,
			});
		});
		it("has no option items", function() {
			assert.strictEqual(model.items.length, 0);
		});
		it("has an option item when a result is selected", function() {
			result.singleModeResult.setSelectedResultName("keep");
			assert.strictEqual(model.items.length, 1, "one option item");
			assert.strictEqual(model.items[0].name, "keep", "item is for \"keep\"");
			assert.strictEqual(model.items[0].constructor.name, "OptionsItem", "item is an OptionsItem");
		});
		it("has a different option item when selected result is changed", function() {
			result.singleModeResult.setSelectedResultName("keep");
			result.singleModeResult.setSelectedResultName("merge");
			assert.strictEqual(model.items.length, 1, "one option item");
			assert.strictEqual(model.items[0].name, "merge", "item is for \"merge\"");
			assert.strictEqual(model.items[0].constructor.name, "OptionsItem", "item is an OptionsItem");
		});
		it("can be re-initialised with the same result and not loose changes", function() {
			result.singleModeResult.setSelectedResultName("keep");
			model.items[0].setSelectedActionName("noActions");
			assert.strictEqual(model.items[0].selectedActionName, "noActions", "action set");
			result.singleModeResult.setSelectedResultName("keep");
			assert.strictEqual(model.items.length, 1, "still one option item");
			assert.strictEqual(model.items[0].name, "keep", "item is still for \"keep\"");
			assert.strictEqual(model.items[0].constructor.name, "OptionsItem", "item is still an OptionsItem");
			assert.strictEqual(model.items[0].selectedActionName, "noActions", "action is still set");
		});
		it("has two option items when two results selected", function() {
			result.setMultimode(true);
			result.multimodeResults.getItems()[0].setSelectedResultName("keep");
			result.multimodeResults.getItems()[1].setSelectedResultName("merge");
			//result.emit("update");
			assert.strictEqual(model.items.length, 2, "two option items");
			assert.strictEqual(model.items[0].name, "keep", "first item is for \"keep\"");
			assert.strictEqual(model.items[0].constructor.name, "OptionsItem", "first item is an OptionsItem");
			assert.strictEqual(model.items[1].name, "merge", "second item is for \"merge\"");
			assert.strictEqual(model.items[1].constructor.name, "OptionsItem", "second item is an OptionsItem");
		});
		it("does not loose changes when a second result is selected", function() {
			result.setMultimode(true);
			result.multimodeResults.getItems()[0].setSelectedResultName("keep");
			model.items[0].setSelectedActionName("noActions");
			assert.strictEqual(model.items.length, 1, "one option item");
			assert.strictEqual(model.items[0].name, "keep", "item is for \"keep\"");
			assert.strictEqual(model.items[0].constructor.name, "OptionsItem", "item is an OptionsItem");
			assert.strictEqual(model.items[0].selectedActionName, "noActions", "item action set to \"noActions\"");

			result.multimodeResults.getItems()[1].setSelectedResultName("merge");
			assert.strictEqual(model.items[0].name, "keep", "first item is still for \"keep\"");
			assert.strictEqual(model.items[0].constructor.name, "OptionsItem", "first item is still an OptionsItem");
			assert.strictEqual(model.items[0].selectedActionName, "noActions", "first item action is still set to \"noActions\"");
		});
	});
	describe("item", function() {
		
		beforeEach(function() {
			userIsSysop = true;
			venue = Venue.Tfd();
			discussion = new Discussion({
				id: "123",
				venue,
				pages: ["Foo", "Bar", "Baz"].map(t => mw.Title.newFromText("Template:"+t)),
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
			model = new Options({
				result,
				venue,
				userIsSysop,
			});
			result.setMultimode(true);
			result.setResultSummary("summary");	
			result.multimodeResults.getItems()[0].setSelectedResultName("keep");
			result.multimodeResults.getItems()[1].setSelectedResultName("redirect");
			result.multimodeResults.getItems()[1].setTargetPageName("Pub");
			result.multimodeResults.getItems()[2].setSelectedResultName("delete");
		});
		it("has action set initially", function() {
			assert.strictEqual(model.items[0].selectedActionName, "updatePages");
			assert.strictEqual(model.items[1].selectedActionName, "redirectAndUpdate");
			assert.strictEqual(model.items[2].selectedActionName, defaultPrefValues.tfdDeleteAction);
		});
		it("can set action", function() {
			model.items[0].setSelectedActionName("noActions");
			assert.strictEqual(model.items[0].selectedActionName, "noActions");
			model.items[0].setSelectedActionName("updatePages");
			assert.strictEqual(model.items[0].selectedActionName, "updatePages");
			model.items[1].setSelectedActionName("noActions");
			assert.strictEqual(model.items[1].selectedActionName, "noActions");
			model.items[2].setSelectedActionName("holdingCell");
			assert.strictEqual(model.items[2].selectedActionName, "holdingCell");
			assert.strictEqual(model.items[2].setSelectedActionName("holdingCell"), false, "returns false if setting to current value");
		});
		it("has initial option values", function() {
			model.items[2].setSelectedActionName("deletePages");
			assert.deepStrictEqual(model.items[0].values, {
				action: "updatePages"
			});
			assert.deepStrictEqual(model.items[1].values, {
				action: "redirectAndUpdate",
				rcats: []
			});
			assert.deepStrictEqual(model.items[2].values, {
				action: "deletePages",
				deleteTalk: true,
				deleteRedir: true
			});
		});
		it("can set boolean option values", function() {
			model.items[2].setSelectedActionName("deletePages");
			model.items[2].setOptionValue("deleteTalk", false);
			assert.deepStrictEqual(model.items[2].values, {
				action: "deletePages",
				deleteTalk: false,
				deleteRedir: true
			});
			
			model.items[2].setOptionValue("deleteRedir", false);
			assert.deepStrictEqual(model.items[2].values, {
				action: "deletePages",
				deleteTalk: false,
				deleteRedir: false
			});
			
			model.items[2].setOptionValue("deleteTalk", true);
			assert.deepStrictEqual(model.items[2].values, {
				action: "deletePages",
				deleteTalk: true,
				deleteRedir: false
			});
		});
		it("can set menu option value", function() {
			model.items[2].setSelectedActionName("holdingCell");
			assert.deepStrictEqual(model.items[2].values, {
				action: "holdingCell",
				holdcellSection: undefined
			});
			model.items[2].setOptionValue("holdcellSection", "review");
			assert.deepStrictEqual(model.items[2].values, {
				action: "holdingCell",
				holdcellSection: "review"
			});
			model.items[2].setOptionValue("holdcellSection", "convert");
			assert.deepStrictEqual(model.items[2].values, {
				action: "holdingCell",
				holdcellSection: "convert"
			});
		});
		it("can set menuTag option values", function() {
			model.items[1].setOptionValue("rcats", ["foo"]);
			assert.deepStrictEqual(model.items[1].values, {
				action: "redirectAndUpdate",
				rcats: ["foo"]
			});
			model.items[1].setOptionValue("rcats", ["foo", "bar"]);
			assert.deepStrictEqual(model.items[1].values, {
				action: "redirectAndUpdate",
				rcats: ["foo", "bar"]
			});
			model.items[1].setOptionValue("rcats", ["bar"]);
			assert.deepStrictEqual(model.items[1].values, {
				action: "redirectAndUpdate",
				rcats: ["bar"]
			});
			model.items[1].setOptionValue("rcats", []);
			assert.deepStrictEqual(model.items[1].values, {
				action: "redirectAndUpdate",
				rcats: []
			});
		});
		it("validates when action has no options", function() {
			assert.strictEqual(model.items[0].isValid, true, "action without options");
		});
		it("validates when action with toggle options", function() {
			model.items[2].setSelectedActionName("deletePages");
			assert.strictEqual(model.items[2].isValid, true, "action with toggle options (both on)");
			model.items[2].setOptionValue("deleteTalk", false);
			assert.strictEqual(model.items[2].isValid, true, "action with toggle options (one on, one off)");
			model.items[2].setOptionValue("deleteRedir", false);
			assert.strictEqual(model.items[2].isValid, true, "action with toggle options (both off)");
		});
		it("validates when action has dropdown menu option", function() {
			model.items[2].setSelectedActionName("holdingCell");
			assert.strictEqual(model.items[2].isValid, false, "action with menu (no item selected");
			model.items[2].setOptionValue("holdcellSection", "review");
			assert.strictEqual(model.items[2].isValid, true, "action with menu (item selected)");
		});
		it("validates when action has menuTagMultiselect option", function() {
			assert.strictEqual(model.items[1].isValid, true, "action with menuTagMultiselect (no items selected)");
			model.items[1].setOptionValue("rcats", ["foo"]);
			assert.strictEqual(model.items[1].isValid, true, "action with menuTagMultiselect (one item selected)");
			model.items[1].setOptionValue("rcats", ["foo", "bar"]);
			assert.strictEqual(model.items[1].isValid, true, "action with menuTagMultiselect (multiple items selected)");
		});	
		it("(List) validates all result options items", function() {
			model.items[2].setSelectedActionName("deletePages");
			assert.strictEqual(model.isValid, true, "Valid if invalid option is not for the selected action");

			model.items[2].setSelectedActionName("holdingCell");
			assert.strictEqual(model.isValid, false, "Invalid if invalid option is for the selected action");

			model.items[2].setOptionValue("holdcellSection", "review");
			assert.strictEqual(model.isValid, true, "Valid if all options are valid");
		});
	});
});