/**
 * This script is used to deploy files to the wiki.
 * You must have interface-admin rights to use this.
 * 
 * ----------------------------------------------------------------------------
 *    Set up:
 * ----------------------------------------------------------------------------
 * 1) Use [[Special:BotPasswords]] to get credentials. Make sure you enable
 *    sufficient permissions.
 * 2) Create a JSON file to store the username and password. This should be
 *    a plain JSON object with keys "username" and "password", see README
 *    file for an example. Save it here in the "bin" directory with file
 *    name "credentials.json".
 *    IMPORTANT: Never commit this file to the repository!
 * 
 * ---------------------------------------------------------------------------
 *    Pre-deployment checklist:
 * ---------------------------------------------------------------------------
 * 1) Changes committed and merged to master branch on GitHub repo
 * 2) Currently on master branch, and synced with GitHub repo
 * 3) Version bumped, and that change commited and synced to GitHub repo 
 * 3) Run a full build using "npm run build"
 * When all of the above are done ==> you are ready to proceed with deployment
 * 
 * --------------------------------------------------------------------------
 *    Usage:
 * --------------------------------------------------------------------------
 * Ensure the pre-deployment steps above are completed, unless you are only
 * deploying to the testwiki (test.wikipedia.org). Then, run this script:
 * In the terminal, enter
 *     node bin/deploy.js
 * and supply the requested details.
 * Notes:
 * - The default summary if not specified is "Updated from repository"
 * - Edit summaries will be prepended with the version number from
 *   the package.json file
 * - Changes to gadget definitions need to be done manually
 */
const fs = require("fs");
const {mwn} = require("mwn");
const {execSync} = require("child_process");
const prompt = require("prompt-sync")({sigint: true});
const {username, password} = require("./credentials.json");

function logError(error) {
	error = error || {};
	console.log(
		(error.info || "Unknown error")+"\n",
		JSON.stringify(error.response||error)
	);
}

// Check for --quick parameter. Quick mode deploys to both enwiki and enwiki-beta, without prompting for any info
const quick = process.argv.includes("--quick");
const config = [];

if (quick) {
	config.push({
		wiki: "en",
		beta: "n",
		userComment: "",
		consoleMessage: "QUICK MODE: Using defaults (en, beta, blank edit summary, auto-continue)"
	});
	config.push({
		wiki: "en",
		beta: "n",
		userComment: "",
		consoleMessage: "QUICK MODE: Using defaults (en, main, blank edit summary, auto-continue)"
	});
} else {
	// Prompt user for info
	wiki = prompt("> Wikipedia subdomain: ");
	beta = prompt("> Beta deployment [Y/n]: ");
	userComment = prompt("> Edit summary message (optional): ");
	config.push({
		wiki: wiki,
		beta: beta,
		userComment: userComment,
		consoleMessage: null
	});

}

for ( let i = 0; i < config.length; i++ ) {
	const wiki = config[i].wiki;
	const beta = config[i].beta;
	const userComment = config[i].userComment;
	const consoleMessage = config[i].consoleMessage;

	if ( consoleMessage ) {
		console.log(consoleMessage);
	}

	// Extract info for edit summary.
	const version = require("../package.json").version;
	const sha = execSync("git rev-parse --short HEAD").toString("utf8").trim();
	const editSummary = `v${version} at ${sha}: ${userComment || "Updated from repository"}`;
	console.log(`Edit summary is: "${editSummary}"`);

	const isBeta = beta.trim().toUpperCase() !== "N";
	const deployments = [
		{file: "loader-gadget.js", target: "MediaWiki:Gadget-XFDcloser.js"},
		{file: "core-gadget.js", target: `MediaWiki:Gadget-XFDcloser-core${isBeta ? "-beta" : ""}.js`},
		{file: "styles-gadget.css", target: `MediaWiki:Gadget-XFDcloser-core${isBeta ? "-beta" : ""}.css`}
	];

	const api = new mwn({
		apiUrl: `https://${wiki}.wikipedia.org/w/api.php`,
		username: username,
		password: password
	});

	console.log(`... logging in as ${username}  ...`);
	api.loginGetToken().then(() => {
		if (!quick) {
			prompt("> Press [Enter] to start deploying or [ctrl + C] to cancel");
		}
		console.log("--- starting deployment ---");
		const editPromises = deployments.map(deployment => {
			let content = fs.readFileSync("./dist/"+deployment.file, "utf8").toString();
			return api.save(deployment.target, content, editSummary).then((response) => {
				const status = response && response.nochange
					? "━ No change saving"
					: "✔ Successfully saved";
				console.log(`${status} ${deployment.file} to ${wiki}:${deployment.target}`);
			}, (error) => {
				console.log(`✘ Failed to save ${deployment.file} to ${wiki}:${deployment.target}`);
				logError(error);
			});
		});
		Promise.all(editPromises).then(() => {
			console.log("--- end of deployment ---");
		});
	}).catch(logError);
}
