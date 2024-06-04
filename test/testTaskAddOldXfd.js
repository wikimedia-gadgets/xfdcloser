/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import AddOldXfd from "../xfdcloser-src/Controllers/Tasks/AddOldXfd";
import TaskItem from "../xfdcloser-src/Models/TaskItem";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
import config from "../xfdcloser-src/config";
import { dateFromUserInput } from "../xfdcloser-src/util";

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
	emit: noop
};

describe("dateFromUserInput", function() {
	it("handles dmy input", function() {
		assert.ok(dateFromUserInput("18 March 2020"));
	});
	it("handles mdy input", function() {
		assert.ok(dateFromUserInput("March 18, 2020"));
	});
	it("handles ymd input", function() {
		assert.ok(dateFromUserInput("2020 March 18"));
	});
});

describe("AddBeingDeleted", function() {
	let discussion, result, options, model, task, summary;
	beforeEach(function() {
		discussion = new Discussion({
			id: "id",
			venue: Venue.Tfd(),
			pages: ["Template:Foo", "Template:Bar"].map(t => mw.Title.newFromText(t)),
			discussionPageName: "Wikipedia:Templates for discussion/2020 March 18",
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
		result.singleModeResult.setTargetPageName("Template:Qux");
		options.getItems()[0].setSelectedActionName("mergeAndUpdate");
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new AddOldXfd(model, widgets);
		summary = "[[Wikipedia:Templates for discussion/2020 March 18#Foo and bar]] closed as merge " + config.script.advert;
	});
	it("beforeEach is ok", function() {
		assert.ok(true);
	});
	it("makes old xfd wikitext", function() {
		assert.deepStrictEqual(
			task.makeOldxfdWikitext(),
			"{{old tfd|date= 18 March 2020 |result=merge |disc=Foo and bar}}\n"
		);
	});
	it("makes new wikitext (no page content)", function() {
		assert.deepStrictEqual(
			task.makeNewWikitext("", "Template talk:Foo"),
			task.makeOldxfdWikitext()
		);
	});
	it("makes new wikitext (no banners)", function() {
		assert.deepStrictEqual(
			task.makeNewWikitext("Lorem ipsum", "Template talk:Foo"),
			task.makeOldxfdWikitext() + "Lorem ipsum"
		);
	});
	it("makes new wikitext (1 old TFD banner)", function() {
		const wikitext = "{{Old TfD|date=2019 June 18|result=keep}}";
		const page1 = "{{subst:#ifexist:Wikipedia:Templates for deletion/Log/2019 June 18"+
				"|Wikipedia:Templates for deletion/Log/2019 June 18#Template:Foo"+
				"|Wikipedia:Templates for discussion/Log/2019 June 18#Template:Foo}}";
		assert.strictEqual(
			task.makeNewWikitext(wikitext, "Template talk:Foo"),
			"{{Old XfD multi |date1=18 June 2019 |result1='''Keep''' |page1=" +page1 +
				" |date2=18 March 2020 |result2='''Merge''' |page2=Wikipedia:Templates for discussion/2020 March 18#Foo and bar}}\n"
		);
	});
	it("makes new wikitext (1 old TFD banner and other content)", function() {
		const wikitext = "{{Old TfD|date=2019 June 18|result=keep}}\nLoremipsum";
		const page1 = "{{subst:#ifexist:Wikipedia:Templates for deletion/Log/2019 June 18"+
				"|Wikipedia:Templates for deletion/Log/2019 June 18#Template:Foo"+
				"|Wikipedia:Templates for discussion/Log/2019 June 18#Template:Foo}}";
		assert.strictEqual(
			task.makeNewWikitext(wikitext, "Template talk:Foo"),
			"{{Old XfD multi |date1=18 June 2019 |result1='''Keep''' |page1=" +page1 +
				" |date2=18 March 2020 |result2='''Merge''' |page2=Wikipedia:Templates for discussion/2020 March 18#Foo and bar}}\nLoremipsum"
		);
	});
	it("makes new wikitext (Old XfD multi)", function() {
		const wikitext = "{{Old XfD multi |date1=2010 February 26 |result1='''Redirect to [[Template:Abbr]]''' |link1={{canonicalurl:Wikipedia:Templates for discussion/Log/2010 February 26#Template:Tooltip}}}}";	
		assert.strictEqual(
			task.makeNewWikitext(wikitext, "Template talk:Foo"),
			"{{Old XfD multi |date1=2010 February 26 |result1='''Redirect to [[Template:Abbr]]''' |link1={{canonicalurl:Wikipedia:Templates for discussion/Log/2010 February 26#Template:Tooltip}}"+
				" |date2=18 March 2020 |result2='''Merge''' |page2=Wikipedia:Templates for discussion/2020 March 18#Foo and bar}}"
		);
	});
	it("makes new wikitext (Old XfD multi and old TFD banner)", function() {
		const wikitext = "{{Old XfD multi |date1=2010 February 26 |result1='''Redirect to [[Template:Abbr]]''' |link1={{canonicalurl:Wikipedia:Templates for discussion/Log/2010 February 26#Template:Tooltip}}}}\n{{Old TfD|date=2019 June 18|result=keep}}\nLoremipsum";
		const page2 = "{{subst:#ifexist:Wikipedia:Templates for deletion/Log/2019 June 18"+
			"|Wikipedia:Templates for deletion/Log/2019 June 18#Template:Foo"+
			"|Wikipedia:Templates for discussion/Log/2019 June 18#Template:Foo}}";
		assert.strictEqual(
			task.makeNewWikitext(wikitext, "Template talk:Foo"),
			"{{Old XfD multi |date1=2010 February 26 |result1='''Redirect to [[Template:Abbr]]''' |link1={{canonicalurl:Wikipedia:Templates for discussion/Log/2010 February 26#Template:Tooltip}}"+
				" |date2=18 June 2019 |result2='''Keep''' |page2=" + page2 +
				" |date3=18 March 2020 |result3='''Merge''' |page3=Wikipedia:Templates for discussion/2020 March 18#Foo and bar}}\nLoremipsum"
		);
	});
	it("transforms a page with content", function() {
		const transformed = task.transform({
			title: "Template talk:Foo",
			content: "Lorem ipsum"
		});
		if ( transformed.then ) {
			transformed.always(console.log);
			throw new Error("Transformation resulted in a promise");
		}
		assert.deepStrictEqual(transformed, {
			section: "0",
			summary: "Old TFD: "+summary,
			text: task.makeNewWikitext("Lorem ipsum", "Template talk:Foo"),
			redirect: false,
		});
	});
	it("transforms a page without content", function() {
		const transformed = task.transform({
			title: "Template talk:Foo",
			missing: true
		});
		if ( transformed.then ) {
			transformed.always(console.log);
			throw new Error("Transformation resulted in a promise");
		}
		assert.deepStrictEqual(transformed, {
			section: "0",
			summary: "Old TFD: "+summary,
			text: task.makeNewWikitext("", "Template talk:Foo"),
			redirect: false,
		});
	});
});
