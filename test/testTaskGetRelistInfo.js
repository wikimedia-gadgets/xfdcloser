/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import GetRelistInfo from "../xfdcloser-src/Controllers/Tasks/GetRelistInfo";
import TaskItem from "../xfdcloser-src/Models/TaskItem";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";

const config = {};

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

describe("GetRelistInfo", function() {
	let discussion, result, options, model, task;
	beforeEach(function() {
		discussion = new Discussion({
			id: "id",
			venue: Venue.Rfd(),
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
			type: "relist",
			userIsSysop: true
		});
		options = new Options({
			result,
			venue: discussion.venue,
			userIsSysop: true
		});
		model = new TaskItem({
			taskName: "foo",
			relaventPageNames: discussion.pagesNames,
			discussion,
			result,
			options
		});
		task = new GetRelistInfo(model, widgets);
	});
	it("gets relist template for first relist", function() {
		const content = "Lorem ipsum dorem sum";
		const relistTemplate = task.getRelistTemplate(content);
		assert.strictEqual(relistTemplate, "{{subst:XfD relist|1=|2=1}}");
	});
	it("gets relist template for second relist", function() {
		const content = "Lorem ipsum dorem sum\n[[Wikipedia:Deletion process#Relisting discussions|Relisted]] bla blah<!-- from Template:Relist --><noinclude>[[Category:Relisted AfD debates|24 Mani Neram]]</noinclude></div><!-- Please add new comments below this line -->";
		const relistTemplate = task.getRelistTemplate(content);
		assert.strictEqual(relistTemplate, "{{subst:XfD relist|1=|2=2}}");
	});
	it("gets relist template for third relist", function() {
		const content = `Lorem ipsum dorem sum
[[Wikipedia:Deletion process#Relisting discussions|Relisted]] bla blah<!-- from Template:Relist --><noinclude>[[Category:Relisted AfD debates|24 Mani Neram]]</noinclude></div><!-- Please add new comments below this line -->;
Foo bar baz qux
[[Wikipedia:Deletion process#Relisting discussions|Relisted]] bla blah<!-- from Template:Relist --><noinclude>[[Category:Relisted AfD debates|24 Mani Neram]]</noinclude></div><!-- Please add new comments below this line -->`;
		const relistTemplate = task.getRelistTemplate(content);
		assert.strictEqual(relistTemplate, "{{subst:XfD relist|1=|2=3}}");
	});
	it("gets relist template with relist comment", function() {
		result.setRationale("Some reasoning here");
		const relistTemplate = task.getRelistTemplate("");
		assert.strictEqual(relistTemplate, "{{subst:XfD relist|1=Some reasoning here|2=1}}");
	});
	it("gets relist wikitexts for RfD", function() {
		const content = "====Foobar====\n*<span id='id1'>Page</span>";
		const result = task.getRelistWikitext(content);
		assert.deepStrictEqual(Object.keys(result), ["newWikitext", "oldLogWikitext"]);
		assert.strictEqual(result.newWikitext, "====Foobar====\n*<span id='id1'>Page</span>\n{{subst:XfD relist|1=|2=1}}\n");
		assert.strictEqual(result.oldLogWikitext, `====Foobar====\n{{subst:rfd relisted|page=${GetRelistInfo.today}|Foobar}}`);
	});
	it("gets relist wikitexts for RfD, multiple pages", function() {
		const content = "====Foobar====\n*<span id='id1'>Page1</span>\n*<span id='id2'>Page2</span>\nLorem ipsum";
		const result = task.getRelistWikitext(content);
		assert.deepStrictEqual(Object.keys(result), ["newWikitext", "oldLogWikitext"]);
		assert.strictEqual(result.oldLogWikitext, `====Foobar====\n<noinclude><span id='id1'></span><span id='id2'></span></noinclude>\n{{subst:rfd relisted|page=${GetRelistInfo.today}|Foobar}}`);
	});
	it("gets relist wikitexts for CfD", function() {
		task.model.venue = Venue.Cfd();
		const content = "====Foobar====\n*<span id='id1'>Page</span>";
		const result = task.getRelistWikitext(content);
		assert.deepStrictEqual(Object.keys(result), ["newWikitext", "oldLogWikitext"]);
		assert.strictEqual(result.newWikitext, "====Foobar====\n*<span id='id1'>Page</span>\n{{subst:XfD relist|1=|2=1}}\n");
		assert.strictEqual(result.oldLogWikitext, "====Foobar====\n{{subst:cfd relisted|Foobar}}");
	});
	it("gets relist wikitexts for MfD", function() {
		task.model.venue = Venue.Mfd();
		const content = "====Foobar====\n:{{pagelinks}}\nLorem ipsum";
		const result = task.getRelistWikitext(content);
		assert.deepStrictEqual(Object.keys(result), ["newWikitext", "oldLogWikitext"]);
		assert.strictEqual(result.newWikitext, "====Foobar====\n:{{pagelinks}}\n{{subst:mfdr}}\nLorem ipsum\n{{subst:XfD relist|1=|2=1}}");
		assert.strictEqual(result.oldLogWikitext, "");
	});
	it("gets relist wikitexts for TfD", function() {
		task.model.venue = Venue.Tfd();
		config.user = {
			isSysop: false,
			sig: "<small>[[Wikipedia:NACD|(non-admin closure)]]</small> ~~~~"
		};
		const content = "====Foobar====\nLorem ipsum";
		const result = task.getRelistWikitext(content);
		assert.deepStrictEqual(Object.keys(result), ["newWikitext", "oldLogWikitext"]);
		assert.strictEqual(result.newWikitext, "====Foobar====\nLorem ipsum\n{{subst:XfD relist|1=|2=1}}\n");
		assert.strictEqual(result.oldLogWikitext, `====Foobar====
{{subst:Tfd top|'''relisted'''}} on [[${task.todaysLogpage}#Foobar|${GetRelistInfo.today}]]. <small>[[Wikipedia:NACD|(non-admin closure)]]</small> ~~~~
* {{tfd links|Foobar}}
{{subst:Tfd bottom}}`);
	});
	it("gets relist wikitexts for TfD, multiple pages", function() {
		task.model.venue = Venue.Tfd();
		task.model.discussion.pages = ["Template:Foobar", "Template:Baz", "Module:Qux"].map(t => mw.Title.newFromText(t));
		config.user = {
			isSysop: false,
			sig: "<small>[[Wikipedia:NACD|(non-admin closure)]]</small> ~~~~"
		};
		const content = "====Foobar====\nLorem ipsum";
		const result = task.getRelistWikitext(content);
		assert.deepStrictEqual(Object.keys(result), ["newWikitext", "oldLogWikitext"]);
		assert.strictEqual(result.newWikitext, "====Foobar====\nLorem ipsum\n{{subst:XfD relist|1=|2=1}}\n");
		assert.strictEqual(result.oldLogWikitext, `====Foobar====
{{subst:Tfd top|'''relisted'''}} on [[${task.todaysLogpage}#Foobar|${GetRelistInfo.today}]]. <small>[[Wikipedia:NACD|(non-admin closure)]]</small> ~~~~
* {{tfd links|Foobar}}
* {{tfd links|Baz}}
* {{tfd links|Qux|module=Module}}
{{subst:Tfd bottom}}`);
	});
	it("gets relist wikitexts for AfD", function() {
		task.model.venue = Venue.Afd();
		const content = "====Foobar====\nLorem ipsum <noinclude>[[Wikipedia:Articles for deletion/Log/2020 October 8#{{anchorencode:Foobar}}|View log]]</noinclude>)\nBax qux etc";
		const result = task.getRelistWikitext(content);
		assert.deepStrictEqual(Object.keys(result), ["newWikitext", "oldLogWikitext"]);
		assert.strictEqual(result.newWikitext, `====Foobar====\nLorem ipsum <noinclude>[[${task.todaysLogpage}#{{anchorencode:Foobar}}|View log]]</noinclude>)\nBax qux etc\n{{subst:XfD relist|1=|2=1}}\n`);
		assert.strictEqual(result.oldLogWikitext, "");
	});
});
