/**
 * This script bundles all source styles (css files in the styles-src directory)
 * into a single file, along with comments for gadget deployment
 */
const concat = require("concat");
const fs = require("fs"); 
  
// Get css files within styles-src directory
const dir = "styles-src";
const filenames = fs.readdirSync(dir)
	.filter(filename => /.\.css$/.test(filename))
	.map(filename => `${dir}/${filename}`);

const destination = "./dist/styles-gadget.css";

concat([
	"core-comment-top.js",
	...filenames,
	"core-comment-bottom.js"
], destination);