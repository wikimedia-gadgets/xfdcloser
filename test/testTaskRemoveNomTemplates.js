/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import RemoveNomTemplates from "../xfdcloser-src/Controllers/Tasks/RemoveNomTemplates";
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

describe("RemoveNomTemplates", function() {
	let discussion, result, options, model, task;
	beforeEach(function() {
		discussion = new Discussion({
			id: "id",
			venue: Venue.Afd(),
			pages: ["Foo", "Bar"].map(t => mw.Title.newFromText(t)),
			discussionPageName: "Wikipedia:Articles for deletion/discussionName",
			sectionHeader: "Foo and bar",
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
		result.singleModeResult.setSelectedResultName("keep");
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new RemoveNomTemplates(model, widgets);
	});
	it("transforms a page with a nom templatge", function() {
		const transformed = RemoveNomTemplates.transform(task, {
			title: "Foo",
			content: `<noinclude>
<!-- Please do not remove or change this AfD message until the discussion has been closed. -->
{{Article for deletion/dated|page=Foo|timestamp=20200617061910|year=2020|month=June|day=17|substed=yes|help=off}}
<!-- Once discussion is closed, please place on talk page: {{Old AfD multi|page=Foo|date=17 June 2020|result='''keep'''}} -->
<!-- End of AfD message, feel free to edit beyond this point -->
</noinclude>
Lorem impsum`
		});
		if ( transformed.then ) {
			transformed.always(console.log);
			throw new Error("Transformation resulted in a promise");
		}
		assert.deepStrictEqual(Object.keys(transformed), ["text", "summary"]);
		assert.strictEqual(transformed.text, "Lorem impsum");
	});
	it("does not transform a page without a nom templatge", function() {
		const transformed = RemoveNomTemplates.transform(task, {
			title: "Foo",
			content: "Lorem impsum"
		});
		if ( !transformed.then ) {
			throw new Error("Transformation did not result in a promise");
		}
		transformed
			.then(p => { console.log(p); throw new Error("promise was resolved"); })
			.catch(e => assert.strictEqual(e, "nominationTemplateNotFound"));
	});
	it("transformNominatedPage does not edit unexpected page", function() {
		const transformed = RemoveNomTemplates.transform(task, {
			title: "Foobar",
			content: "Lorem impsum"
		});
		if ( !transformed.then ) {
			throw new Error("Transformation did not result in a promise");
		}
		return transformed.then( () => {
			throw new Error("Transformation promise was resolved");
		}, code => {
			assert.strictEqual(code, "unexpectedTitle");
		});
	});
	it("transformNominatedPage does not edit a nonexistent page", function() {
		mw.Title.exist.set(mw.Title.newFromText("Foo").getPrefixedDb(), false);
		const transformed = RemoveNomTemplates.transform(task, {
			title: "Foo",
			content: "Lorem impsum"
		});
		if ( !transformed.then ) {
			throw new Error("Transformation did not result in a promise");
		}
		return transformed.then( () => {
			throw new Error("Transformation promise was resolved");
		}, code => {
			assert.strictEqual(code, "doesNotExist");
		});
	});
});