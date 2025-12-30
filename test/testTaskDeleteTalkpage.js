/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import DeleteTalkpages from "../xfdcloser-src/Controllers/Tasks/DeleteTalkpages";
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
		task = new DeleteTalkpages(model, widgets);
	});
	it("fails verification for base user talpage", function() {
		const talkpage = "User talk:Foo";
		mw.Title.exist.set(mw.Title.newFromText(talkpage).getPrefixedDb(), true);
		const verification = task.verifyPage(talkpage);
		assert.strictEqual(verification, false);
	});
	it("fails verification for non-existant talkpage", function() {
		const talkpage = "Talk:Foo";
		mw.Title.exist.set(mw.Title.newFromText(talkpage).getPrefixedDb(), false);
		const verification = task.verifyPage(talkpage);
		assert.strictEqual(verification, false);
	});
	it("passes verification for existant non-base-user talkpage", function() {
		const talkpage = "Talk:Foo";
		mw.Title.exist.set(mw.Title.newFromText(talkpage).getPrefixedDb(), true);
		const verification = task.verifyPage(talkpage);
		assert.strictEqual(verification, true);
	});
});
