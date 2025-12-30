/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import TagTalkWithSpeedy from "../xfdcloser-src/Controllers/Tasks/TagTalkWithSpeedy";
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

describe("TagTalkWithSpeedy", function() {
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
		task = new TagTalkWithSpeedy(model, widgets);
	});
	it("verifies existing talkpage as true", function() {
		const talkpage = "Talk:Foobar";
		mw.Title.exist.set(mw.Title.newFromText(talkpage).getPrefixedDb(), true);
		result = task.verifyPage(talkpage);
		assert.strictEqual(result, true);
	});
	it("verifies non-existing talkpage as false", function() {
		const talkpage = "Talk:Fooqux";
		mw.Title.exist.set(mw.Title.newFromText(talkpage).getPrefixedDb(), false);
		result = task.verifyPage(talkpage);
		assert.strictEqual(result, false);
	});
	it("verifies user base talkpage as false", function() {
		const talkpage = "User talk:Example";
		mw.Title.exist.set(mw.Title.newFromText(talkpage).getPrefixedDb(), true);
		result = task.verifyPage(talkpage);
		assert.strictEqual(result, false);
	});
	it("skips doing task if no talkpages exist", function() {
		mw.Title.exist.set(discussion.pages.map(t => t.getTalkPage().getPrefixedDb()), false);
		const taskPromise = task.doTask();
		if ( !taskPromise.then ) {
			throw new Error("doTask did not return a promise");
		}
		return taskPromise
			.then((r) => {
				assert.strictEqual(r, "Skipped"); 
			})
			.catch(function(e) {
				console.log("task promise rejected", e);
				throw new Error("task promise was rejected");
			});
	});
});
