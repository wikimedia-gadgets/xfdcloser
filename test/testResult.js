/* eslint-env node, mocha */
import assert from "assert";
import Result from "../xfdcloser-src/Models/Result";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import { mw } from "../globals";

describe("Result", function() {
	let model;
	describe("Top notes", function() {
		it("has a basic-mode note and not a discussion pages note if there are no pages", function() {
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [],
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: true
			});
			const basicModeNote = model.topNotes.find(note => note.name === "basicMode");
			assert.ok(basicModeNote);
			const discussionPagesNote = model.topNotes.find(note => note.name === "discussionPages");
			assert.strictEqual(discussionPagesNote, undefined);
		});
		it("has a discussion pages note and not a basic-mode note if there are pages", function() {
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [ mw.Title.newFromText("Foo") ],
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: true
			});
			const basicModeNote = model.topNotes.find(note => note.name === "basicMode");
			assert.strictEqual(basicModeNote, undefined);
			const discussionPagesNote = model.topNotes.find(note => note.name === "discussionPages");
			assert.ok(discussionPagesNote);
		});
		it("has a non-admin not if user is not an admin", function() {
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [ mw.Title.newFromText("Foo") ],
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: false
			});
			const nonAdminWarning = model.topNotes.find(note => note.name === "nonAdminWarning");
			assert.ok(nonAdminWarning);
		});
		it("does not have a non-admin warning if user is an admin", function() {
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [ mw.Title.newFromText("Foo") ],
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: true
			});
			const nonAdminWarning = model.topNotes.find(note => note.name === "nonAdminWarning");
			assert.strictEqual(nonAdminWarning, undefined);
		});
	});
	describe("Relisting", function() {
		beforeEach(function() {
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [ mw.Title.newFromText("Foo") ],
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "relist",
				userIsSysop: true
			});
		});
		it("does not show resultFieldset", function() {
			assert.strictEqual(model.showResultFieldset, false);
		});
		it("labels rationale input as \"Relist comment\"", function() {
			assert.strictEqual(model.rationaleHeading, "Relist comment");
		});
		it("is valid regardless of rational content", function() {
			assert.ok(model.isValid);
			model.setRationale("Foo bar");
			assert.ok(model.isValid);
			model.setRationale("\x01\x02\x03");
			assert.ok(model.isValid);
			model.setRationale("   ");
			assert.ok(model.isValid);
		});
		it("does not show the \"Copy from above\" button", function() {
			assert.strictEqual(model.showCopyButton, false);
		});
		it("does not show the new sentence option", function() {
			assert.strictEqual(model.showNewSentenceOption, false);
		});
		it("correctly generates preview wikitext", function() {
			assert.strictEqual(model.previewWikitext, "{{XfD relist|1=}}", "Empty rationale");
			model.setRationale("   ");
			assert.strictEqual(model.previewWikitext, "{{XfD relist|1=}}", "Whitespace-only rationale");
			model.setRationale("Foo");
			assert.strictEqual(model.previewWikitext, "{{XfD relist|1=Foo}}", "Regular rationale");
			model.setRationale("Foo  ");
			assert.strictEqual(model.previewWikitext, "{{XfD relist|1=Foo}}", "Regular rationale with trailing whitespace");
			model.setRationale("[[Foo|Foobar]]");
			assert.strictEqual(model.previewWikitext, "{{XfD relist|1=[[Foo|Foobar]]}}", "Rationale with piped wikilink");
			model.setRationale("{{tl|foo}}");
			assert.strictEqual(model.previewWikitext, "{{XfD relist|1={{tl|foo}}}}", "Rationale with template containing pipe");
			model.setRationale("some|reason");
			assert.strictEqual(model.previewWikitext, "{{XfD relist|1=some&#124;reason}}", "Rationale with loose pipe");
		});
		it("only emits update if updated rationale is the same as the current rationale", function() {
			const emittedUpdate1 = model.setRationale("Foo") !== false;
			const emittedUpdate2 = model.setRationale("Foo") !== false;
			assert.strictEqual(emittedUpdate1, true);
			assert.strictEqual(emittedUpdate2, false);
		});
	});
	describe("Closing (single-mode)", function() {
		beforeEach(function() {
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [ mw.Title.newFromText("Foo"), mw.Title.newFromText("Bar") ],
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: true
			});
		});
		it("does show resultFieldset", function() {
			assert.strictEqual(model.showResultFieldset, true);
		});
		it("is not in multimode", function() {
			assert.strictEqual(model.isMultimode, false);
		});
		it("labels rationale input as \"Rationale\"", function() {
			assert.strictEqual(model.rationaleHeading, "Rationale");
		});
		it("does not show the \"Copy from above\" button", function() {
			assert.strictEqual(model.showCopyButton, false);
		});
		it("shows the new sentence option", function() {
			assert.strictEqual(model.showNewSentenceOption, true);
		});
		it("does not initially have a selected result", function() {
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true);
			assert.strictEqual(model.uniqueSelectedResults.length, 0);
		});
		it("formats rationale", function() {
			assert.strictEqual(model.getFormattedRationale(), "", "Empty string if rationale is empty");
			model.setRationale("  ");
			assert.strictEqual(model.getFormattedRationale(), "", "Empty string if rationale is whitespace");
			model.setRationale("foo");
			assert.strictEqual(model.getFormattedRationale(), "foo", "Simple rationale");
			model.setRationale("*foo");
			assert.strictEqual(model.getFormattedRationale(), "\n*foo", "Needs an initial linebreak");
		});
		it("formats punctuated rationale (not a new sentance)", function() {
			model.setNewSentence(false);
			assert.strictEqual(model.getFormattedRationale("punctuated"), "", "Empty string if rationale is empty");
			model.setRationale("  ");
			assert.strictEqual(model.getFormattedRationale("punctuated"), "", "Empty string if rationale is whitespace");
			model.setRationale("foo");
			assert.strictEqual(model.getFormattedRationale("punctuated"), " foo", "Simple rationale");
			model.setRationale("*foo");
			assert.strictEqual(model.getFormattedRationale("punctuated"), "\n*foo", "Needs an initial linebreak");
		});
		it("formats punctuated rationale (as a new sentence)", function() {
			model.setNewSentence(true);
			assert.strictEqual(model.getFormattedRationale("punctuated"), "", "Empty string if rationale is empty");
			model.setRationale("  ");
			assert.strictEqual(model.getFormattedRationale("punctuated"), "", "Empty string if rationale is whitespace");
			model.setRationale("Bar");
			assert.strictEqual(model.getFormattedRationale("punctuated"), ". Bar", "Simple rationale");
			model.setRationale("*Bar");
			assert.strictEqual(model.getFormattedRationale("punctuated"), ".\n*Bar", "Needs an initial linebreak");
		});
		it("correctly generates preview wikitext", function() {
			assert.strictEqual(model.previewWikitext, "The result of the discussion was .", "Incomplete sentence when invalid");

			model.singleModeResult.setSelectedResultName("keep");
			assert.strictEqual(model.previewWikitext, "The result of the discussion was '''keep'''.", "Simple result");

			model.singleModeResult.setSpeedyResult(true);
			assert.strictEqual(model.previewWikitext, "The result of the discussion was '''speedy keep'''.", "Prefixed result");
			
			model.singleModeResult.setSelectedResultName("redirect");
			model.singleModeResult.setTargetPageName("Foobar");
			assert.strictEqual(model.previewWikitext, "The result of the discussion was '''redirect''' to [[Foobar]].", "Result with target");

			model.singleModeResult.setSelectedResultName("custom");
			model.singleModeResult.setCustomResultText("baz qux");
			assert.strictEqual(model.previewWikitext, "The result of the discussion was '''baz qux'''.", "Custom result");

			model.singleModeResult.setSelectedResultName("keep");
			model.singleModeResult.setSpeedyResult(false);
			model.setRationale("because of reasons.");
			model.setNewSentence(false);
			assert.strictEqual(model.previewWikitext, "The result of the discussion was '''keep''' because of reasons.", "Simple rationale");

			model.setRationale("Further explanation.");
			model.setNewSentence(true);
			assert.strictEqual(model.previewWikitext, "The result of the discussion was '''keep'''. Further explanation.", "Simple rationale");			
		});
		it("correctly sets validity", function() {
			assert.strictEqual(model.isValid, false, "Initially invalid");

			model.singleModeResult.setSelectedResultName("keep");
			assert.strictEqual(model.isValid, true, "Valid with keep result");
			
			model.singleModeResult.setSelectedResultName("redirect");
			assert.strictEqual(model.isValid, false, "Invalid with redirect result and no target");

			model.singleModeResult.setTargetPageName("Bar");
			assert.strictEqual(model.isValid, true, "Valid with redirect result and valid target");

			model.singleModeResult.setSelectedResultName("custom");
			assert.strictEqual(model.isValid, false, "Invalid with custom result and no custom result text");

			model.singleModeResult.setCustomResultText("Qux");
			assert.strictEqual(model.isValid, true, "Valid with custom result and custom result text");
		});
	});
	describe("Closing (multimode)", function() {
		beforeEach(function() {
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [ mw.Title.newFromText("Foo"), mw.Title.newFromText("Bar") ],
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: true
			});
			model.setMultimode(true);
		});
		it("does show resultFieldset", function() {
			assert.strictEqual(model.showResultFieldset, true);
		});
		it("is in multimode", function() {
			assert.strictEqual(model.isMultimode, true);
		});
		it("labels rationale input as \"Rationale\"", function() {
			assert.strictEqual(model.rationaleHeading, "Rationale");
		});
		it("does show the \"Copy from above\" button", function() {
			assert.strictEqual(model.showCopyButton, true);
		});
		it("shows the new sentence option", function() {
			assert.strictEqual(model.showNewSentenceOption, true);
		});
		it("has one multimode result per page", function() {
			assert.strictEqual(model.multimodeResults.getItems().length, 2);
		});
		it("can update and validate result summary", function() {
			assert.strictEqual(model.resultSummary, "");
			assert.strictEqual(model.resultSummaryIsValid, false, "Initially invalid");
			model.setResultSummary("  ");
			assert.strictEqual(model.resultSummary, "  ");
			assert.strictEqual(model.resultSummaryIsValid, false, "Whitespace-only is invalid");
			model.setResultSummary("foobar");
			assert.strictEqual(model.resultSummary, "foobar");
			assert.strictEqual(model.resultSummaryIsValid, true, "Valid if not empty or whitespace (1)");
			model.setResultSummary("keep some, delete others");
			assert.strictEqual(model.resultSummary, "keep some, delete others");
			assert.strictEqual(model.resultSummaryIsValid, true, "Valid if not empty or whitespace (2)");
		});
		it("shows the \"Copy from above\" button", function() {
			assert.strictEqual(model.showCopyButton, true);
		});
		it("can copy unselected results to rationale", function() {
			model.copyResultsToRationale();
			assert.strictEqual(model.rationale, "*''' ''' [[Foo]]\n*''' ''' [[Bar]]\n", "both unselected");

			model.setRationale("");
			model.multimodeResults.getItems()[0].setSelectedResultName("keep");
			model.copyResultsToRationale();
			assert.strictEqual(model.rationale, "*'''Keep''' [[Foo]]\n*''' ''' [[Bar]]\n", "one unselected");

			model.setRationale("");
			model.multimodeResults.getItems()[1].setSelectedResultName("delete");
			model.copyResultsToRationale();
			assert.strictEqual(model.rationale, "*'''Keep''' [[Foo]]\n*'''Delete''' [[Bar]]\n", "both simple results");

			model.setRationale("");
			model.multimodeResults.getItems()[1].setSelectedResultName("redirect");
			model.copyResultsToRationale();
			assert.strictEqual(model.rationale, "*'''Keep''' [[Foo]]\n*'''Redirect''' [[Bar]] to [[]]\n", "target required but not set");

			model.setRationale("");
			model.multimodeResults.getItems()[1].setTargetPageName("Qux");
			model.copyResultsToRationale();
			assert.strictEqual(model.rationale, "*'''Keep''' [[Foo]]\n*'''Redirect''' [[Bar]] to [[Qux]]\n", "target");

			model.setRationale("");
			model.multimodeResults.getItems()[1].setTargetPageName("Category:Qux");
			model.copyResultsToRationale();
			assert.strictEqual(model.rationale, "*'''Keep''' [[Foo]]\n*'''Redirect''' [[Bar]] to [[:Category:Qux]]\n", "target requires colon");

			model.setRationale("The quick brown fox jumps over the lazy dog.");
			model.multimodeResults.getItems()[1].setSelectedResultName("delete");
			model.copyResultsToRationale();
			assert.strictEqual(model.rationale, "*'''Keep''' [[Foo]]\n*'''Delete''' [[Bar]]\nThe quick brown fox jumps over the lazy dog.", "Non-empty rationale");

			// Switch to a model for an FFD discussion
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [ mw.Title.newFromText("File:Foo.jpg"), mw.Title.newFromText("File:Bar.png") ],
					discussionPageName: "Wikipedia:Files for discussion/2020 March 14",
					sectionHeader: "File:Foo.jpg",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: true
			});
			model.setMultimode(true);
			model.multimodeResults.getItems()[0].setSelectedResultName("keep");
			model.multimodeResults.getItems()[1].setSelectedResultName("delete");
			model.copyResultsToRationale();
			assert.strictEqual(model.rationale, "*'''Keep''' [[:File:Foo.jpg]]\n*'''Delete''' [[:File:Bar.png]]\n", "page names need colons");
		});
		it("correctly generates preview wikitext", function() {
			assert.strictEqual(model.previewWikitext, "The result of the discussion was .", "Incomplete sentence when invalid");
			model.multimodeResults.getItems()[0].setSelectedResultName("keep");
			model.multimodeResults.getItems()[1].setSelectedResultName("merge");
			model.multimodeResults.getItems()[1].setTargetPageName("Qux");
			model.setNewSentence(true);
			model.setResultSummary("do not delete");
			assert.strictEqual(model.previewWikitext, "The result of the discussion was '''do not delete'''.", "No rationale");
			model.copyResultsToRationale();
			assert.strictEqual(model.previewWikitext, "The result of the discussion was '''do not delete'''.\n*'''Keep''' [[Foo]]\n*'''Merge''' [[Bar]] to [[Qux]]", "With rationale");			
		});
		it("correctly sets validity", function() {
			assert.strictEqual(model.isValid, false, "Initially invalid");

			model.setResultSummary("do not delete");
			assert.strictEqual(model.isValid, false, "Result summary without results is not valid");

			model.multimodeResults.getItems()[0].setSelectedResultName("keep");
			assert.strictEqual(model.isValid, false, "Result summary without all results is not valid");

			model.multimodeResults.getItems()[1].setSelectedResultName("redirect");
			assert.strictEqual(model.isValid, false, "Result summary with all results selected, but not all valid, is not valid");

			model.multimodeResults.getItems()[1].setTargetPageName("Qux");
			assert.strictEqual(model.isValid, true, "Valid with result summary, all results selected and valid");

			model.setResultSummary("");
			assert.strictEqual(model.isValid, false, "Results without result summary is not valid");
		});
		it("identifies unique results", function() {
			// Switch to a model with four pages
			model = new Result({
				discussion: new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: ["Foo", "Bar", "Baz", "Qux"].map(t => mw.Title.newFromText(t)),
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				}),
				type: "close",
				userIsSysop: true
			});
			model.setMultimode(true);
			model.setResultSummary("summary");

			// No results
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true, "is arrary when invalid");
			assert.strictEqual(model.uniqueSelectedResults.length, 0, "is empty arrary when invalid");

			// Some but not all results
			model.multimodeResults.getItems()[0].setSelectedResultName("keep");
			model.multimodeResults.getItems()[1].setSelectedResultName("delete");
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true, "is arrary when some are invalid");
			assert.strictEqual(model.uniqueSelectedResults.length, 2, "does not count invalid results");

			// All same result
			model.multimodeResults.getItems().forEach(result => result.setSelectedResultName("keep"));
			assert.strictEqual(model.isValid, true, "is valid with one result");
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true, "is arrary when valid with one result");
			assert.strictEqual(model.uniqueSelectedResults.length, 1, "one result only");

			// All same result, with options
			model.multimodeResults.getItems().forEach((result, index) => {
				result.setSelectedResultName("redirect");
				result.setTargetPageName(`A${index} road`);
			});
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true, "is arrary when valid with one result, different options");
			assert.strictEqual(model.uniqueSelectedResults.length, 1, "one result only, different options");
			
			model.multimodeResults.getItems()[1].setSelectedResultName("keep");
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true, "is arrary when valid with two results (1)");
			assert.strictEqual(model.uniqueSelectedResults.length, 2, "two results (1)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[0], model.uniqueSelectedResults[1], "two different results (1)");
			
			model.multimodeResults.getItems()[2].setSelectedResultName("keep");
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true, "is arrary when valid with two results (2)");
			assert.strictEqual(model.uniqueSelectedResults.length, 2, "two results (2)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[0], model.uniqueSelectedResults[1], "two different results (2)");
			
			model.multimodeResults.getItems()[3].setSelectedResultName("delete");
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true, "is arrary when valid with three results");
			assert.strictEqual(model.uniqueSelectedResults.length, 3, "three results");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[0], model.uniqueSelectedResults[1], "three different results (a)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[0], model.uniqueSelectedResults[2], "three different results (b)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[1], model.uniqueSelectedResults[2], "three different results (c)");

			model.multimodeResults.getItems()[2].setSelectedResultName("merge");
			assert.strictEqual(Array.isArray(model.uniqueSelectedResults), true, "is arrary when valid with four results");
			assert.strictEqual(model.uniqueSelectedResults.length, 4, "four results");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[0], model.uniqueSelectedResults[1], "four different results (a)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[0], model.uniqueSelectedResults[2], "four different results (b)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[0], model.uniqueSelectedResults[3], "four different results (c)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[1], model.uniqueSelectedResults[2], "four different results (d)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[1], model.uniqueSelectedResults[3], "four different results (e)");
			assert.notDeepStrictEqual(model.uniqueSelectedResults[2], model.uniqueSelectedResults[3], "four different results (f)");
		});
	});
});
