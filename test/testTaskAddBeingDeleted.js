/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import AddBeingDeleted from "../xfdcloser-src/Controllers/Tasks/AddBeingDeleted";
import TaskItem from "../xfdcloser-src/Models/TaskItem";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
import config from "../xfdcloser-src/config";

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

describe("AddBeingDeleted", function() {
	let discussion, result, options, model, task;
	beforeEach(function() {
		discussion = new Discussion({
			id: "id",
			venue: Venue.Tfd(),
			pages: ["Template:Foo", "Template:Bar"].map(t => mw.Title.newFromText(t)),
			discussionPageName: "WP:TFD/discussionPageName",
			sectionHeader: "Foo and bar",
			sectionNumber: 42,
			firstCommentDate: new Date("2020-03-18T12:22Z"),
			isRelisted: false,
			userIsSysop: true
		});
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
		options.getItems()[0].setSelectedActionName("holdingCell");
		options.getItems()[0].setOptionValue("holdcellSection", "review");
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new AddBeingDeleted(model, widgets);
	});
	it("transforms a page without a nomination template", function() {
		const page = {
			title: "Template:Foo",
			titleTransformation: {
				original: "Template:Foo"
			},
			content: "blah blah blah"
		};
		const transformed = task.transform(page);
		if ( transformed.then ) {
			transformed.catch((e,m) => console.warn("Error "+e, m));
			throw new Error("transformed is a promise");
		}
		assert.deepStrictEqual(
			transformed,
			{
				text: "<noinclude>{{Being deleted|2020 March 18|Foo and bar}}</noinclude>blah blah blah",
				summary: "Added {{being deleted}} per [[WP:TFD/discussionPageName#Foo and bar]] " + config.script.advert
			}
		);
	});
	it("tags ready-section pages with speedy deletion template", function() {
		options.getItems()[0].setOptionValue("holdcellSection", "ready");
		const page = {
			title: "Template:Foo",
			titleTransformation: {
				original: "Template:Foo"
			},
			content: "blah blah blah"
		};
		const transformed = task.transform(page);
		if ( transformed.then ) {
			transformed.catch((e,m) => console.warn("Error "+e, m));
			throw new Error("transformed is a promise");
		}
		assert.deepStrictEqual(
			transformed,
			{
				text: "<noinclude>{{Db-xfd|fullvotepage=WP:TFD/discussionPageName#Foo and bar}}</noinclude>blah blah blah",
				summary: "[[WP:G6|G6]] Speedy deletion nomination, per [[WP:TFD/discussionPageName#Foo and bar]] " + config.script.advert
			}
		);
	});
	it("transforms a merge target", function() {
		result.singleModeResult.setSelectedResultName("merge");
		result.singleModeResult.setTargetPageName("Template:Foo");
		options.getItems()[0].setSelectedActionName("holdingCellMerge");
		options.getItems()[0].setOptionValue("holdcellMergeSection", "merge-transport");
		task.initialise();
		const page = {
			title: "Template:Foo",
			titleTransformation: {
				original: "Template:Foo"
			},
			content: "{{Template for discussion/dated|action=|page=X5|link=Wikipedia:Templates for discussion/Log/2018 May 17#X5 and others|bigbox={{#invoke:Noinclude|noinclude|text=yes}}}}blah blah blah"
		};
		const transformed = task.transform(page);
		if ( transformed.then ) {
			transformed.catch((e,m) => console.warn("Error "+e, m));
			throw new Error("transformed is a promise");
		}
		assert.deepStrictEqual(
			transformed,
			{
				text: "blah blah blah",
				summary: "[[WP:TFD/discussionPageName#Foo and bar]] closed as merge " + config.script.advert
			}
		);
	});
	it("transforms a merge title", function() {
		result.singleModeResult.setSelectedResultName("merge");
		result.singleModeResult.setTargetPageName("Template:Foo");
		options.getItems()[0].setSelectedActionName("holdingCellMerge");
		options.getItems()[0].setOptionValue("holdcellMergeSection", "merge-transport");
		task.initialise();
		const page = {
			title: "Template:Bar",
			titleTransformation: {
				original: "Template:Bar"
			},
			content: "{{Template for discussion/dated|action=|page=X5|link=Wikipedia:Templates for discussion/Log/2018 May 17#X5 and others|bigbox={{#invoke:Noinclude|noinclude|text=yes}}}}blah blah blah"
		};
		const transformed = task.transform(page);
		if ( transformed.then ) {
			transformed.catch((e,m) => console.warn("Error "+e, m));
			throw new Error("transformed is a promise");
		}
		assert.deepStrictEqual(
			transformed,
			{
				text: "<noinclude>{{Being deleted|2020 March 18|Foo and bar|merge=Template:Foo}}</noinclude>blah blah blah",
				summary: "Added {{being deleted}} per [[WP:TFD/discussionPageName#Foo and bar]] " + config.script.advert
			}
		);
	});
	it("transforms module docs", function() {
		discussion.pages = [mw.Title.newFromText("Module:Foobar")];
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
		options.getItems()[0].setSelectedActionName("holdingCell");
		options.getItems()[0].setOptionValue("holdcellSection", "review");
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new AddBeingDeleted(model, widgets);

		const page = {
			title: "Module:Foobar/doc",
			titleTransformation: {
				original: "Module:Foobar/doc"
			},
			content: "Lorem ipsum dorem sum"
		};
		const transformed = task.transform(page);
		if ( transformed.then ) {
			transformed.catch((e,m) => console.warn("Error "+e, m));
			throw new Error("transformed is a promise");
		}
		assert.deepStrictEqual(
			transformed,
			{
				text: "<includeonly>{{Being deleted|2020 March 18|Foo and bar}}</includeonly>Lorem ipsum dorem sum",
				summary: "Added {{being deleted}} per [[WP:TFD/discussionPageName#Foo and bar]] " + config.script.advert
			}
		);
	});
});