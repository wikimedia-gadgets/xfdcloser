const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const hostname = "127.0.0.1";
const port = 8125;
const root = path.resolve(__dirname, "..");
const sourcePaths = [
	"xfdcloser-src", "globals-src", "loader-src", "styles-src",
	"package.json", "package-lock.json", ".babelrc",
	"core-comment-top.js", "core-comment-bottom.js", "bin/concatCss.js"
];
const developmentFiles = new Set([
	"/dist/loader-dev.js", "/dist/core.js", "/dist/styles-gadget.css"
]);

function getSourceSnapshot() {
	const entries = [];
	function addEntry(relativePath) {
		const fullPath = path.join(root, relativePath);
		const stat = fs.statSync(fullPath);
		entries.push(`${relativePath}:${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`);
		if (stat.isDirectory()) {
			fs.readdirSync(fullPath).sort().forEach(name => addEntry(path.join(relativePath, name)));
		}
	}
	sourcePaths.forEach(addEntry);
	return entries.join("\n");
}

function runBuild() {
	return new Promise((resolve, reject) => {
		const child = spawn("npm run build:dev", { cwd: root, shell: true, stdio: "inherit" });
		child.on("error", reject);
		child.on("exit", (code, signal) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Development build failed (${signal || `exit code ${code}`})`));
			}
		});
	});
}

function createBuildManager(getSnapshot, build) {
	let builtSnapshot;
	let failedSnapshot;
	let buildError;
	let building;

	async function ensureBuilt() {
		if (building) {
			try {
				await building;
			} catch (error) {
				if (getSnapshot() === failedSnapshot) throw error;
			}
			return ensureBuilt();
		}
		const snapshot = getSnapshot();
		if (snapshot === builtSnapshot) return;
		if (snapshot === failedSnapshot) throw buildError;

		building = build().then(() => {
			builtSnapshot = snapshot;
			failedSnapshot = undefined;
		}, error => {
			failedSnapshot = snapshot;
			buildError = error;
			throw error;
		}).finally(() => {
			building = undefined;
		});
		try {
			await building;
		} catch (error) {
			if (getSnapshot() === failedSnapshot) throw error;
		}
		return ensureBuilt();
	}

	return { ensureBuilt };
}

function startServer() {
	const manager = createBuildManager(getSourceSnapshot, runBuild);
	let lastLoggedError;
	let ready = false;
	function reportError(error) {
		if (error !== lastLoggedError) {
			console.error("[XFDC] Development build failed:", error);
			lastLoggedError = error;
		}
	}
	function checkForChanges() {
		manager.ensureBuilt().then(() => {
			lastLoggedError = undefined;
			if (!ready) {
				ready = true;
				console.log(`Server running at http://${hostname}:${port}/; source changes rebuild automatically.`);
			}
		}, reportError);
	}

	const server = http.createServer(async (request, response) => {
		const pathname = new URL(request.url, `http://${hostname}:${port}`).pathname;
		const filePath = path.join(root, pathname);
		response.setHeader("Cache-Control", "no-store");
		if (developmentFiles.has(pathname)) {
			try {
				await manager.ensureBuilt();
			} catch (error) {
				reportError(error);
				response.writeHead(500);
				response.end("Development build failed; see the server console.\n");
				return;
			}
		}
		const contentType = /\.css$/.test(filePath) ? "text/css" : "text/javascript";
		fs.readFile(filePath, function(error, content) {
			if (error) {
				response.writeHead(error.code === "ENOENT" ? 404 : 500);
				response.end("Sorry, check with the site admin for error: " + error.code + " ..\n");
			} else {
				response.writeHead(200, { "Content-Type": contentType });
				response.end(content, "utf-8");
			}
		});
	});

	server.listen(port, hostname, () => {
		checkForChanges();
		setInterval(checkForChanges, 1000);
	});
}

if (require.main === module) {
	startServer();
}

module.exports = { createBuildManager };
