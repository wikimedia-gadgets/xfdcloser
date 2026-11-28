/* eslint-env node, mocha */
const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const vm = require("vm");

describe("bin/deploy.js", function() {
	async function runDeployment(credentials) {
		const requests = [];
		const server = http.createServer((request, response) => {
			let body = "";
			request.on("data", chunk => { body += chunk; });
			request.on("end", () => {
				const params = new URLSearchParams(request.method === "GET" ? request.url.split("?")[1] : body);
				requests.push({ params, authorization: request.headers.authorization });
				let data;
				if (params.get("action") === "login") {
					data = { login: { result: "Success" } };
				} else if (params.get("action") === "edit") {
					data = { edit: { result: "Success" } };
				} else if (params.get("type") === "login") {
					data = { query: { tokens: { logintoken: "login-token" } } };
				} else {
					data = { query: {
						tokens: { csrftoken: "edit-token" },
						userinfo: { rights: [] },
						general: { legaltitlechars: "A-Za-z" },
						namespaces: { 0: { id: 0, name: "", canonical: "" } },
						namespacealiases: []
					} };
				}
				response.writeHead(200, { "Content-Type": "application/json" });
				response.end(JSON.stringify(data));
			});
		});
		await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
		try {
			const apiUrl = `http://127.0.0.1:${server.address().port}/w/api.php`;
			const fakeFs = {
				existsSync: () => true,
				readFileSync: file => file.endsWith("credentials.json")
					? JSON.stringify({ ...credentials, site: apiUrl })
					: "test content"
			};
			const logs = [];
			const source = fs.readFileSync(path.join(__dirname, "../bin/deploy.js"), "utf8");
			const run = vm.runInNewContext(source, {
				__dirname: path.join(__dirname, "../bin"),
				process: { argv: ["node", "deploy.js", "--quick"] },
				console: { log: (...args) => logs.push(args.join(" ")), error: (...args) => logs.push(args.join(" ")) },
				require: name => {
					if (name === "fs") return fakeFs;
					if (name === "child_process") return { execSync: () => Buffer.from("abc123") };
					if (name === "prompt-sync") return () => () => { throw new Error("Unexpected prompt"); };
					if (name === "../package.json") return require("../package.json");
					return require(name);
				}
			});
			await run;
			assert.strictEqual(logs.filter(line => line.includes("Successfully saved")).length, 6, logs.join("\n"));
			return requests;
		} finally {
			await new Promise(resolve => server.close(resolve));
		}
	}

	for (const auth of [
		{ name: "OAuth 2", credentials: { accessToken: "test-access-token" } },
		{ name: "bot passwords", credentials: { username: "Test@Bot", password: "test-password" } }
	]) {
		it(`deploys beta and live using ${auth.name}`, async function() {
			const requests = await runDeployment(auth.credentials);
			const edits = requests.filter(request => request.params.get("action") === "edit");
			assert.deepStrictEqual(edits.map(edit => edit.params.get("title")), [
				"MediaWiki:Gadget-XFDcloser.js",
				"MediaWiki:Gadget-XFDcloser-core-beta.js",
				"MediaWiki:Gadget-XFDcloser-core-beta.css",
				"MediaWiki:Gadget-XFDcloser.js",
				"MediaWiki:Gadget-XFDcloser-core.js",
				"MediaWiki:Gadget-XFDcloser-core.css"
			]);
			assert.ok(edits.every(edit => edit.params.get("token") === "edit-token"));
			assert.ok(edits.every(edit => edit.params.get("text") === "test content" &&
				edit.params.get("summary").endsWith(" at abc123: Updated from repository")));
			if (auth.credentials.accessToken) {
				assert.ok(requests.every(request => request.authorization === "Bearer test-access-token"));
				assert.ok(!requests.some(request => request.params.get("action") === "login"));
			} else {
				const logins = requests.filter(request => request.params.get("action") === "login");
				assert.strictEqual(logins.length, 2);
				assert.ok(logins.every(login => login.params.get("lgname") === "Test@Bot" &&
					login.params.get("lgpassword") === "test-password"));
			}
		});
	}
});
