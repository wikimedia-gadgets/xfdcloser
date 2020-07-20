/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import CloseDiscussion from "../xfdcloser-src/Controllers/Tasks/CloseDiscussion";
import TaskItem from "../xfdcloser-src/Models/TaskItem";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
import config from "../xfdcloser-src/config";
// import config from "../xfdcloser-src/config";
// import { dmyDateString } from "../xfdcloser-src/util";

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

describe("CloseDiscussion", function() {
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
		task = new CloseDiscussion(model, widgets);
	});
	it("sectionHeadingText extracts section heading text", function() {
		const headings = [
			"==Plain==",
			"===Plain sub===",
			"=== Spacing ===",
			"==    Uneven spacing  ==",
			"==Multiple  spaces==",
			"==[[Linked]]==",
			"==[[link|Piped link]]==",
			"=={{tl|Linked template}}==",
			"==Encoded&amp;char=="
		];
		const encoded = headings.map(heading => CloseDiscussion.sectionHeadingText(heading));
		const expected = [
			"Plain",
			"Plain sub",
			"Spacing",
			"Uneven spacing",
			"Multiple spaces",
			"Linked",
			"Piped link",
			"{{Linked template}}",
			"Encoded&char"
		];
		assert.deepStrictEqual(encoded, expected);
	});
	it("Transforms a discussion", function() {
		const page = {
			revisions: [{
				timestamp: "2020-02-20T03:24:00"
			}],
			content: `===[[:Foobar]]===
{{REMOVE THIS TEMPLATE WHEN CLOSING THIS AfD|M}}

<noinclude>{{AFD help}}</noinclude>
:{{la|Foobar}} – (<includeonly>[[Wikipedia:Articles for deletionFoobar|View AfD]]</includeonly>)
:({{Find sources AFD|Foobar}})
Fails [[WP:GNG]] and [[WP:NMUSIC]] [[User:Example|Example]] ([[User talk:Example|talk]]) 01:10, 20 July 2020 (UTC)`
		};
		const transformed = task.transform(page);
		if ( transformed.then ) {
			throw new Error("transform returned a promise");
		}
		const expectedText = `{{subst:Afd top|'''delete'''}}. ${config.user.sig}
===[[:Foobar]]===
<noinclude>{{AFD help}}</noinclude>
:{{la|Foobar}} – (<includeonly>[[Wikipedia:Articles for deletionFoobar|View AfD]]</includeonly>)
:({{Find sources AFD|Foobar}})
Fails [[WP:GNG]] and [[WP:NMUSIC]] [[User:Example|Example]] ([[User talk:Example|talk]]) 01:10, 20 July 2020 (UTC)
{{subst:Afd bottom}}`;
		assert.deepStrictEqual(Object.keys(transformed), ["section", "text", "summary"]);
		assert.strictEqual(transformed.text, expectedText);
		assert.strictEqual(transformed.section, 1);
		assert.strictEqual(transformed.summary, `/* Foobar */ Closed as delete ${config.script.advert}`);
	});
	it("Transforms a discussion and removes closing template", function() {
		const page = {
			revisions: [{
				timestamp: "2020-02-20T03:24:00"
			}],
			content: `===[[:Foobar]]===
{{closing}}
{{REMOVE THIS TEMPLATE WHEN CLOSING THIS AfD|M}}

<noinclude>{{AFD help}}</noinclude>
:{{la|Foobar}} – (<includeonly>[[Wikipedia:Articles for deletionFoobar|View AfD]]</includeonly>)
:({{Find sources AFD|Foobar}})
Fails [[WP:GNG]] and [[WP:NMUSIC]] [[User:Example|Example]] ([[User talk:Example|talk]]) 01:10, 20 July 2020 (UTC)`
		};
		const transformed = task.transform(page);
		if ( transformed.then ) {
			throw new Error("transform returned a promise");
		}
		const expectedText = `{{subst:Afd top|'''delete'''}}. ${config.user.sig}
===[[:Foobar]]===
<noinclude>{{AFD help}}</noinclude>
:{{la|Foobar}} – (<includeonly>[[Wikipedia:Articles for deletionFoobar|View AfD]]</includeonly>)
:({{Find sources AFD|Foobar}})
Fails [[WP:GNG]] and [[WP:NMUSIC]] [[User:Example|Example]] ([[User talk:Example|talk]]) 01:10, 20 July 2020 (UTC)
{{subst:Afd bottom}}`;
		assert.deepStrictEqual(Object.keys(transformed), ["section", "text", "summary"]);
		assert.strictEqual(transformed.text, expectedText);
		assert.strictEqual(transformed.section, 1);
		assert.strictEqual(transformed.summary, `/* Foobar */ Closed as delete ${config.script.advert}`);
	});
	it("does not transform an edit-conflicted discussion (time-based)", function() {
		const page = {
			revisions: [{
				timestamp: Date.now()
			}],
			content: "content"
		}
		const transformed = task.transform(page);
		if ( !transformed.then ) {
			throw new Error("transform did not return a promise");
		};
		return transformed.then(
			() => {
				throw new Error("transform promise was resolved")
			},
			(code) => {
				assert.strictEqual(code, "abort"); // expected to be aborted
			}
		);
	});
	it("does not transform an edit-conflicted discussion (section-based)", function() {
		const page = {
			revisions: [{
				timestamp: "2020-02-20T03:24:00"
			}],
			content: "==heading==\ncontent"
		}
		const transformed = task.transform(page);
		if ( !transformed.then ) {
			throw new Error("transform did not return a promise");
		};
		return transformed.then(
			() => {
				throw new Error("transform promise was resolved")
			},
			(code) => {
				assert.strictEqual(code, "abort"); // expected to be aborted
			}
		);
	});
	it("does not transform a closed discussion", function() {
		const page = {
			revisions: [{
				timestamp: "2020-02-20T03:24:00"
			}],
			content: "==[[:Foobar]]==\ncontent\n<!--Template:Afd bottom-->"
		}
		const transformed = task.transform(page);
		if ( !transformed.then ) {
			throw new Error("transform did not return a promise");
		};
		return transformed.then(
			() => {
				throw new Error("transform promise was resolved")
			},
			(code) => {
				assert.strictEqual(code, "abort"); // expected to be aborted
			}
		);
	});
});