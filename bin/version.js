/**
 * This script is used to bump the version number.
 * Semantic version numbering is used in the form "[major].[minor].[patch]"
 * where
 *  - bug fixes and very small changes increment the patch number
 *  - new features and other changes increment the minor number and reset the
 *    patch number to 0
 *  - significant changes, such as shifting coding paradyms or completely
 *    redesigning the UI, increment the major number and reset both the minor
 *    and patch numbers to 0
 * 
 * --------------------------------------------------------------------------
 *    Usage:
 * --------------------------------------------------------------------------
 * To increment the patch number: In the terminal, enter
 *     node bin/version --bump
 * or
 *     node bin/version --bump --patch
 * 
 * To increment the minor number (and reset the patch number to 0): In the
 * terminal, enter
 *     node bin/version --bump --minor
 * 
 * To increment the major number (and reset both the minor and patch numbers
 * to 0): In the terminal, enter
 *     node bin/version --bump --major
 * 
 * To manually set the version: In the terminal, enter
 *     node bin/version --set "MM.mm.pp"
 * where "MM.mm.pp" is the version number, like "4.2.11"
 */
(function() {
	const replace = require("replace-in-file");
	const oldversion = require("../package.json").version.trim();
	console.log("Old version", oldversion);
	const [op, version] = process.argv.slice(2);
	let major, minor, patch;
	if (!op) {
		console.error("Error: An option is required");
		return;
	} else if (op == "--set" && !version) {
		console.error("Error: Version number not provided");
		return;
	}
	if (op == "--bump") {
		[major, minor, patch] = oldversion.split(".").map(val => Number(val));
		if (version == "--major") {
			major++;
			minor = 0;
			patch = 0;
		} else if (version == "--minor") {
			minor++;
			patch = 0;
		} else if (!version || version == "--patch") {
			patch++;
		} else {
			console.error(`Error: Unrecognised option "${version}"`);
			return;
		}
	} else if (op == "--set") {
		[major, minor, patch] = version.split(".").map(val => Number(val));
	} else {
		console.error(`Error: Unrecognised option "${op}"`);
		return;
	}

	if ([major, minor, patch].some(val => isNaN(val))) {
		console.error("Something went wrong, updated version number contained NaN");
		return;
	} else if ([major, minor, patch].some(val => val == null)) {
		console.error("Something went wrong, updated version number contained null or undefined");
		return;
	}

	const newVersion = `${major}.${minor}.${patch}`;
	console.log("New version", newVersion);

	// In package and package-lock, replace the version
	const options = {
		files: [
			"package.json",
			"package-lock.json"
		],
		from: /("version":\s*)"\d+\.\d+\.\d+"/,
		to: `"version": "${newVersion}"`
	};
	try {
		const results = replace.sync(options);
		const changedResults = results.filter(result => result.hasChanged);
		changedResults.forEach( result =>
			console.log(`Updated version in ${result.file}`)
		);
		console.log(`--- Done ${changedResults.length}/${options.files.length} replacements ---`);
	} catch (error) {
		console.error("Error occurred:", error);
	}
})();