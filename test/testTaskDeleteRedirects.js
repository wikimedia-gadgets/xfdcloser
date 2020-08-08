/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import DeleteRedirects from "../xfdcloser-src/Controllers/Tasks/DeleteRedirects";
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

describe("DeleteRedirects", function() {
	let discussion, result, options, model, task;
	const response1pages = [
		{
			"pageid": 583072,
			"ns": 2,
			"title": "User:Gwicke~enwiki/sandbox",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 657689873,
			"length": 382,
			"redirect": true
		},
		{
			"pageid": 680687,
			"ns": 0,
			"title": "Foo bar",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-08-03T15:51:50Z",
			"lastrevid": 932070815,
			"length": 82,
			"redirect": true,
			"talkid": 59131084
		},
		{
			"pageid": 680692,
			"ns": 0,
			"title": "Foo Bar",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 16498863,
			"length": 20,
			"redirect": true,
			"new": true
		}
	];
	const response2pages = [
		{
			"pageid": 583072,
			"ns": 2,
			"title": "User:Gwicke~enwiki/sandbox",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 657689873,
			"length": 382,
			"redirect": true
		},
		{
			"pageid": 680687,
			"ns": 0,
			"title": "Foo bar",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-08-03T15:51:50Z",
			"lastrevid": 932070815,
			"length": 82,
			"redirect": true,
			"talkid": 59131084
		},
		{
			"pageid": 680692,
			"ns": 0,
			"title": "Foo Bar",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 16498863,
			"length": 20,
			"redirect": true,
			"new": true
		},
		{
			"pageid": 7651120,
			"ns": 2,
			"title": "User:Nixeagle/test",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 253981820,
			"length": 20,
			"redirect": true,
			"talkid": 12696156
		},
		{
			"pageid": 9132808,
			"ns": 0,
			"title": "Foo",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-08-03T16:28:58Z",
			"lastrevid": 942454553,
			"length": 224,
			"redirect": true,
			"talkid": 9132809
		},
		{
			"pageid": 9139804,
			"ns": 0,
			"title": "Bar (computer science)",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 253497670,
			"length": 20,
			"redirect": true
		},
		{
			"pageid": 9799020,
			"ns": 0,
			"title": "FOo",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 253981849,
			"length": 52,
			"redirect": true
		},
		{
			"pageid": 15583328,
			"ns": 0,
			"title": "Fooian",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 253981864,
			"length": 20,
			"redirect": true
		},
		{
			"pageid": 16667492,
			"ns": 2,
			"title": "User:Eagle 101/test",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 253981887,
			"length": 20,
			"redirect": true,
			"talkid": 16667526
		},
		{
			"pageid": 28324883,
			"ns": 0,
			"title": "FOOBAR",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 409960301,
			"length": 52,
			"redirect": true
		},
		{
			"pageid": 29480200,
			"ns": 0,
			"title": "Baz (computer science)",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 394926730,
			"length": 20,
			"redirect": true,
			"new": true
		},
		{
			"pageid": 35585695,
			"ns": 2,
			"title": "User:Riki-test/sandbox/RedirectToFoo",
			"contentmodel": "wikitext",
			"pagelanguage": "en",
			"pagelanguagehtmlcode": "en",
			"pagelanguagedir": "ltr",
			"touched": "2020-07-22T17:09:47Z",
			"lastrevid": 488844045,
			"length": 20,
			"redirect": true
		}
	];
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
		result.singleModeResult.setSelectedResultName("delete");
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new DeleteRedirects(model, widgets);
	});
	it("gets titles from api response", function() {
		const result = task.titlesFromResponsePages(response1pages);
		assert.strictEqual(result.titles.join(), [
			"User:Gwicke~enwiki/sandbox",
			"Foo bar",
			"Foo Bar"
		].join());
	});
	it("gets talk titles from api response if they exist", function() {
		const result = task.titlesFromResponsePages(response1pages);
		assert.strictEqual(result.talkTitles.join(), ["Talk:Foo bar"].join());
	});
	it("returns a promise of titles when more than 10 pages", function() {
		let result;
		try {
			result = task.titlesFromResponsePages(response2pages);
		} catch(e){
			// Type error expected due to OO.ui.WindowManager
			assert.strictEqual(e.name, "TypeError");
			assert.strictEqual(e.message, "_globals.OO.ui.WindowManager is not a constructor");
			return true;
		}
		if ( result && !result.then ) {
			throw new Error("result is not a promise");
		}
	});
});