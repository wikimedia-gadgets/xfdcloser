/* eslint-env node, mocha */
import assert from "assert";
import { $, mw } from "../globals";
import AddMergeTemplates from "../xfdcloser-src/Controllers/Tasks/AddMergeTemplates";
import TaskItem from "../xfdcloser-src/Models/TaskItem";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
import { dmyDateString } from "../xfdcloser-src/util";

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

describe("AddMergeTemplates", function() {
	let discussion, result, options, model, task;
	const dateNow = new Date();
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
		result.singleModeResult.setSelectedResultName("merge");
		result.singleModeResult.setTargetPageName("Qux");
		options.getItems()[0].setSelectedActionName("mergeAndUpdate");
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new AddMergeTemplates(model, widgets);
	});
	it("transformNominatedPage adds mergeTo template", function() {
		const transformed = task.transformNominatedPage.call(task, {
			title: "Foo",
			content: "Lorem impsum"
		});
		if ( transformed.then ) {
			transformed.always(console.log);
			throw new Error("Transformation resulted in a promise");
		}
		assert.deepStrictEqual(transformed, {
			text: `{{Afd-merge to|Qux|discussion=discussionName|date=${dmyDateString(dateNow)}}}\nLorem impsum`,
			summary: "[[Wikipedia:Articles for deletion/discussionName]] closed as merge"
		});
	});
	it("transformNominatedPage replaces nomination template with mergeTo template", function() {
		const transformed = task.transformNominatedPage.call(task, {
			title: "Foo",
			content: `<!-- Please do not remove or change this AfD message until the discussion has been closed. -->
{{Article for deletion/dated|page=Foo|timestamp=20200617061910|year=2020|month=June|day=17|substed=yes|help=off}}
<!-- Once discussion is closed, please place on talk page: {{Old AfD multi|page=Foo|date=17 June 2020|result='''keep'''}} -->
<!-- End of AfD message, feel free to edit beyond this point -->
Lorem impsum`
		});
		if ( transformed.then ) {
			transformed.always(console.log);
			throw new Error("Transformation resulted in a promise");
		}
		assert.deepStrictEqual(transformed, {
			text: `{{Afd-merge to|Qux|discussion=discussionName|date=${dmyDateString(dateNow)}}}\nLorem impsum`,
			summary: "[[Wikipedia:Articles for deletion/discussionName]] closed as merge"
		});
	});
	it("transformNominatedPage does not edit unexpected page", function() {
		const transformed = task.transformNominatedPage.call(task, {
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
		const transformed = task.transformNominatedPage.call(task, {
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
	
	it("transformTargetTalk adds mergeFrom template", function() {
		const transformed = task.transformTargetTalk({
			title: "Talk:Qux",
			content: "Lorem impsum"
		});
		if ( transformed.then ) {
			transformed.always(console.log);
			throw new Error("Transformation resulted in a promise");
		}
		assert.deepStrictEqual(transformed, {
			prependtext: `{{Afd-merge from|Foo|discussion=discussionName|date=${dmyDateString(dateNow)}}}\n{{Afd-merge from|Bar|discussion=discussionName|date=${dmyDateString(dateNow)}}}\n`,
			summary: "[[Wikipedia:Articles for deletion/discussionName]] closed as merge"
		});
	});
	it("transformTargetTalk does not edit unexpected target page", function() {
		const transformed = task.transformTargetTalk({
			title: "Foobar",
			content: "Lorem impsum"
		});
		if ( !transformed.then ) {
			throw new Error("Transformation did not result in a promise");
		}
		return transformed.then( () => {
			throw new Error("Transformation promise was resolved");
		}, code => {
			assert.strictEqual(code, "unexpectedTarget");
		});
	});

	it("transformTargetPage prepends {{Being merged from}} templates for AFD merges", function() {
		const transformed = task.transformTargetPage({
			title: "Qux",
			content: "Lorem impsum"
		});
		assert.deepStrictEqual(transformed, {
			prependtext: "{{Being merged from|Foo|discussion=discussionName|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n" +
				"{{Being merged from|Bar|discussion=discussionName|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n",
			summary: "[[Wikipedia:Articles for deletion/discussionName]] closed as merge"
		});
	});

	it("adds templates to each distinct target using its own sources", function() {
		result.setMultimode(true);
		result.setResultSummary("merge");
		const [foo, bar] = result.multimodeResults.getItems();
		foo.setSelectedResultName("merge");
		foo.setTargetPageName("Qux");
		bar.setSelectedResultName("merge");
		bar.setTargetPageName("Quux");

		const edits = [];
		task.api = {
			editWithRetry(titles, getParams, transform, onSuccess) {
				titles.forEach(title => {
					edits.push({title, params: transform({title, content: "Existing content"})});
					onSuccess();
				});
				return $.Deferred().resolve();
			}
		};

		return task.doTask().then(() => {
			const targetEdits = edits.filter(edit => ["Qux", "Quux"].includes(edit.title));
			assert.deepStrictEqual(targetEdits, [
				{
					title: "Qux",
					params: {
						prependtext: "{{Being merged from|Foo|discussion=discussionName|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n",
						summary: "[[Wikipedia:Articles for deletion/discussionName]] closed as merge"
					}
				},
				{
					title: "Quux",
					params: {
						prependtext: "{{Being merged from|Bar|discussion=discussionName|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n",
						summary: "[[Wikipedia:Articles for deletion/discussionName]] closed as merge"
					}
				}
			]);
		});
	});

	it("transformTargetPage edits the whole target page when a section is specified", function() {
		result.singleModeResult.setTargetPageName("Qux#Section");
		const transformed = task.transformTargetPage({
			title: "Qux",
			content: "Lorem impsum"
		});
		assert.ok(transformed.prependtext.includes("{{Being merged from|Foo|"));
		assert.ok(transformed.prependtext.includes("{{Being merged from|Bar|"));
	});

	it("transformTargetPage adds templates for a soft merge", function() {
		result.singleModeResult.setSoftResult(true);
		const transformed = task.transformTargetPage({
			title: "Qux",
			content: "Lorem impsum"
		});
		assert.deepStrictEqual(transformed, {
			prependtext: "{{Being merged from|Foo|discussion=discussionName|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n" +
				"{{Being merged from|Bar|discussion=discussionName|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n",
			summary: "[[Wikipedia:Articles for deletion/discussionName]] closed as soft merge"
		});
	});

	it("transformTargetPage does not add a template outside AFD", function() {
		model.venue = Venue.Mfd();
		const transformed = task.transformTargetPage({
			title: "Qux",
			content: "Lorem impsum"
		});
		return transformed.then(
			() => { throw new Error("Transformation promise was resolved"); },
			code => { assert.strictEqual(code, "unexpectedVenue"); }
		);
	});
});
