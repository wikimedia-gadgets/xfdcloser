/* eslint-env node, mocha */
import assert from "assert";
import TaskList from "../xfdcloser-src/Models/TaskList";

describe.skip("TaskListModel", function() {
	it("exists", function() {
		assert.ok(TaskList);
	});
	it("can be instantiated", function() {
		assert.ok(new TaskList());
	});
});