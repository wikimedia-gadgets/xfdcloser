/* eslint-env node, mocha */
import assert from "assert";
import UpdateDiscussion from "../xfdcloser-src/Controllers/Tasks/UpdateDiscussion";
import UpdateNewLogPage from "../xfdcloser-src/Controllers/Tasks/UpdateNewLogPage";
import UpdateOldLogPage from "../xfdcloser-src/Controllers/Tasks/UpdateOldLogPage";

describe("Edit tags", function() {
	it("tags discussion edits", function() {
		const task = Object.create(UpdateDiscussion.prototype);
		task.model = {
			discussion: {
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				relistInfo: {
					discussionPageTimestamps: {base: "base", start: "start"},
					newWikitext: "updated discussion"
				}
			},
			venue: {type: "afd"}
		};

		assert.strictEqual(task.getParams().tags, "XFDcloser");
		assert.strictEqual(task.getParams().summary, "Relisting discussion");
	});

	it("tags new log edits", function() {
		const task = Object.create(UpdateNewLogPage.prototype);
		task.model = {
			venue: {path: "Wikipedia:Articles for deletion/Log/", type: "afd"},
			discussion: {
				relistInfo: {
					today: "2020 January 1",
					newLogEditType: "appendtext",
					newLogWikitext: "new log entry"
				},
				discussionPageName: "Wikipedia:Articles for deletion/Foo"
			}
		};

		assert.strictEqual(task.getParams().tags, "XFDcloser");
		assert.strictEqual(task.getParams().summary, "Relisting [[:Wikipedia:Articles for deletion/Foo]]");
	});

	it("tags old log edits", function() {
		const task = Object.create(UpdateOldLogPage.prototype);
		task.model = {
			venue: {type: "afd"},
			discussion: {
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				relistInfo: {
					oldlogtitle: "Wikipedia:Articles for deletion/Log/2020 January 1",
					oldLogWikitext: "updated old log"
				}
			}
		};

		assert.strictEqual(task.getParams().tags, "XFDcloser");
		assert.strictEqual(task.getParams().summary, "Relisting [[:Wikipedia:Articles for deletion/Foo]]");
	});
});
