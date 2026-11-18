/* eslint-env node, mocha */
import assert from "assert";
import { createBuildManager } from "../bin/server";

describe("bin/server.js", function() {
	it("waits for the latest source changes before serving concurrent requests", async function() {
		let snapshot = "first";
		const builds = [];
		const manager = createBuildManager(() => snapshot, () => new Promise(resolve => builds.push(resolve)));
		const first = manager.ensureBuilt();
		const second = manager.ensureBuilt();
		assert.strictEqual(builds.length, 1);
		snapshot = "second";
		builds[0]();
		await new Promise(resolve => setImmediate(resolve));
		assert.strictEqual(builds.length, 2);
		builds[1]();
		await Promise.all([first, second]);
		await manager.ensureBuilt();
		assert.strictEqual(builds.length, 2);
	});

	it("reports build failures until the sources change, then retries", async function() {
		let snapshot = "broken";
		let builds = 0;
		const failure = new Error("build failed");
		const manager = createBuildManager(() => snapshot, () => {
			builds++;
			return snapshot === "broken" ? Promise.reject(failure) : Promise.resolve();
		});
		await assert.rejects(manager.ensureBuilt(), failure);
		await assert.rejects(manager.ensureBuilt(), failure);
		assert.strictEqual(builds, 1);
		snapshot = "fixed";
		await manager.ensureBuilt();
		assert.strictEqual(builds, 2);
	});

	it("retries when the sources change during a failed build", async function() {
		let snapshot = "broken";
		let rejectBuild;
		let builds = 0;
		const manager = createBuildManager(() => snapshot, () => {
			builds++;
			return builds === 1
				? new Promise((resolve, reject) => { rejectBuild = reject; })
				: Promise.resolve();
		});
		const request = manager.ensureBuilt();
		snapshot = "fixed";
		rejectBuild(new Error("build failed"));
		await request;
		assert.strictEqual(builds, 2);
	});
});
