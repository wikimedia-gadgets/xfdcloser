/* eslint-env node, mocha */
import assert from "assert";
import unlink from "../xfdcloser-src/unlink";

/* ========== Data to use in tests ============================================================== */
var original = "[[Lorem]] ipsum [[dolor]] sit amet, consectetur adipiscing elit, sed do eiusmod "+
"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud "+
"exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure "+
"[[dolor]]s in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. "+
"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui [[lorem|officia]] deserunt "+
"mollit anim id est laborum.";
var listItems = "*[[Lorem]]\n*ipsum [[dolor]]\n*[[sit]] [[amet]]\n*[[consectetur]]";
var file1 = "{{Infobox ipsum\n|image1=File:Foobar.png\n|image2=Foobar.png\n|param=value}}";
var file2 = "[[File:Foobar.png|thumb|right|200px|caption]]";
var file3 = "<gallery>\nFile:Foobar.png|caption\nFile:Otherimage.jpg|Othercaption\n</gallery>";
var portal1 = "{{Portal|Foo|Bar}}";
var portal2 = "{{portal|Foo}}";
var portal3 = "Lorem ipsum.\n\n==See also==\n*{{Portal-inline|Foo}}\n*{{Portal-inline|Bar}}\n\n==External links==";
var portal4 = "Lorem ipsum.\n\n==See also==\n*{{Portal-inline|Foo}}\n\n==External links==";
var portal5 = "{{Portal bar|Foo|Bar}}";
var portal6 = "{{Portal bar|Foo}}";
var portal7 = "{{Subject bar |portal= Foo |portal2= Primates "+
"|s= y |s-search= Author:William Charles Osman Hill |v= y }}";
// Per [[Special:Diff/894178603]]
var portal8 = "=== Section ===\nLorem ipsum.{{Portal|Hip hop}}\n\n==References==";
var portal9 = "=== Section ===\n{{Portal|Hip hop}}\nLorem ipsum.\n\n==References==";
// Per [[Special:Diff/903501933]]
var portal10 = `{{Strategic Air Command}}

{{Subject bar
|portal1=United States Army
|portal2=United States Air Force
|portal3=World War I
|portal4=World War II
|commons=y
}}

{{good article}}`;

describe("unlink function", function() {
	it("make no changes if nothing to replace", function() {
		var unlinked = unlink(original, ["Foo"], 0);
		assert.strictEqual(unlinked, original, "No change");
	});

	it("unlinks simple and piped links", function() {
		var unlinked1 = unlink(original, ["Lorem"], 0);
		var expected1 = "Lorem ipsum [[dolor]] sit amet, consectetur adipiscing elit, sed do eiusmod "+
		"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud "+
		"exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure "+
		"[[dolor]]s in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. "+
		"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt "+
		"mollit anim id est laborum.";
		assert.strictEqual(unlinked1, expected1, "One page");	

		var unlinked2 = unlink(original, ["Lorem", "Dolor"], 0);
		var expected2 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "+
		"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud "+
		"exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure "+
		"dolors in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. "+
		"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt "+
		"mollit anim id est laborum.";
		assert.strictEqual(unlinked2, expected2, "Two pages");
	});

	it("unlinks list items", function() {
		var unlinked1 = unlink(listItems, ["Lorem"], 0);
		var expected1 = "{{subst:void}}*{{subst:^|<strong>}}Lorem{{subst:^|</strong>}}\n*ipsum [[dolor]]\n*[[sit]] [[amet]]\n*[[consectetur]]";
		assert.strictEqual(unlinked1, expected1, "Single-link list item unlinked and marked for review");

		var unlinked2 = unlink(listItems, ["dolor"], 0);
		var expected2 = "*[[Lorem]]\n{{subst:void}}*ipsum {{subst:^|<strong>}}dolor{{subst:^|</strong>}}\n*[[sit]] [[amet]]\n*[[consectetur]]";
		assert.strictEqual(unlinked2, expected2, "Not single-link list item unlinked and marked for review");

		var unlinked3 = unlink("{{Navbox|list1=\n"+listItems+"}}", ["Lorem"], 10);
		var expected3 = "{{Navbox|list1=\n*ipsum [[dolor]]\n*[[sit]] [[amet]]\n*[[consectetur]]}}";
		assert.strictEqual(unlinked3, expected3, "Navbox list item removed");

		var unlinked4 = unlink(listItems, ["dolor"], 0, true);
		var expected4 = "*[[Lorem]]\n*[[sit]] [[amet]]\n*[[consectetur]]";
		assert.strictEqual(unlinked4, expected4, "Disambiguation item removed");

		var unlinked5 = unlink(listItems+"\n\n{{Given name}}", ["dolor"], 0);
		var expected5 = "*[[Lorem]]\n*[[sit]] [[amet]]\n*[[consectetur]]\n\n{{Given name}}";
		assert.strictEqual(unlinked5, expected5, "Set index article for names treated like disambiguation");
	});

	it("unlinks files", function() {
		var unlinked1 = unlink(file1, ["File:Foobar.png"], 0);
		var expected1 = "{{Infobox ipsum\n\n\n|param=value}}";
		assert.strictEqual(unlinked1, expected1, "Infobox images");

		var unlinked2 = unlink(file2+"Lorem ipsum", ["File:Foobar.png"], 0);
		var expected2 = "Lorem ipsum";
		assert.strictEqual(unlinked2, expected2, "Normal image");

		var unlinked3 = unlink(file3, ["File:Foobar.png"], 0);
		var expected3 = "<gallery>\n\nFile:Otherimage.jpg|Othercaption\n</gallery>";
		assert.strictEqual(unlinked3, expected3, "Gallery image");	
	});

	it("unlinks portals", function() {
		var unlinked1 = unlink(portal1, ["Portal:Foo"], 0);
		var expected1 = "{{Portal|Bar}}";
		assert.strictEqual(unlinked1, expected1, "Multiple portals in {{Portal}}");

		var unlinked2 = unlink(portal2, ["Portal:Foo"], 0);
		var expected2 = "";
		assert.strictEqual(unlinked2, expected2, "Single portal in {{Portal}}");

		var unlinked3 = unlink(portal3, ["Portal:Foo"], 0);
		var expected3 = "Lorem ipsum.\n\n==See also==\n*{{Portal-inline|Bar}}\n\n==External links==";
		assert.strictEqual(unlinked3, expected3, "List with multiple {{Portal-inline}} templates");

		var unlinked4 = unlink(portal4, ["Portal:Foo"], 0);
		var expected4 = "Lorem ipsum.\n\n==External links==";
		assert.strictEqual(unlinked4, expected4, "List with single {{Portal-inline}} template");

		var unlinked5 = unlink(portal5, ["Portal:Foo"], 0);
		var expected5 = "{{Portal bar|Bar}}";
		assert.strictEqual(unlinked5, expected5, "Multiple portals in {{Portal bar}}");

		var unlinked6 = unlink(portal6, ["Portal:Foo"], 0);
		var expected6 = "";
		assert.strictEqual(unlinked6, expected6, "Single portal in {{Portal bar}}");

		var unlinked7 = unlink(portal7, ["Portal:Foo"], 0);
		var expected7 = "{{Subject bar |portal2= Primates "+
		"|s= y |s-search= Author:William Charles Osman Hill |v= y }}";
		assert.strictEqual(unlinked7, expected7, "{{Subject bar}}");

		var unlinked8 = unlink(portal8, ["Portal:Hip hop"], 0);
		var expected8 = "=== Section ===\nLorem ipsum.\n\n==References==";
		assert.strictEqual(unlinked8, expected8, "{{Portal}} at end of a line");

		var unlinked9 = unlink(portal9, ["Portal:Hip hop"], 0);
		var expected9 = "=== Section ===\nLorem ipsum.\n\n==References==";
		assert.strictEqual(unlinked9, expected9, "{{Portal}} on it's own line");	

		var unlinked10 = unlink(portal10, ["Portal:United States Army"], 0);
		var expected10 = `{{Strategic Air Command}}

{{Subject bar
|portal2=United States Air Force
|portal3=World War I
|portal4=World War II
|commons=y
}}

{{good article}}`;
		assert.strictEqual(unlinked10, expected10, "{{Subject bar}} per [[Special:Diff/903501933]]");
	});

});