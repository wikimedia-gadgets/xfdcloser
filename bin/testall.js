// This script replaces any left-over occurances .only within the test files. While .only is useful
// when testing a specific file or function, when doing a build all tests should be run (except any
// which are skipped).
const replace = require("replace-in-file");
const options = {
	files: "test/*.js",
	from: /(describe|it).only\(/g,
	to: "$1(",
	countMatches: true,
};
try {
	const results = replace.sync(options);
	results.filter(result => result.hasChanged).forEach( result =>
		console.log(`Removed ${result.numReplacements} occcurance${result.numReplacements === 1 ? "" :"s"} of .only from ${result.file}`)
	);
} catch (error) {
	console.error("Error occurred:", error);
}