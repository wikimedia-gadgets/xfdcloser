/* eslint-env node, mocha */
import assert from "assert";
import ResultItem from "../xfdcloser-src/Models/ResultItem";
import { getRelevantResults } from "../xfdcloser-src/data";

describe("ResultItem", function() {
	let model;
	beforeEach(function() {
		model = new ResultItem({
			availableResults: getRelevantResults("afd", true)
		});
	});
	it("does not initially have a selected result", function() {
		assert.strictEqual(model.selectedResultName, "");
	});
	it("does not initially show options, target input, or custom result input", function() {
		assert.strictEqual(model.showResultOptions, false, "resultOptions not shown");
		assert.strictEqual(model.showTarget, false, "target input not shown");
		assert.strictEqual(model.showCustomResult, false, "custom result input not shown");
	});
	it("can select result from name", function() {
		model.setSelectedResultName("keep");
		assert.strictEqual(model.selectedResultName, "keep");
		assert.ok(model.selectedResult);
		assert.deepStrictEqual(model.availableResults[0], model.selectedResult);

		model.setSelectedResultName("delete");
		assert.strictEqual(model.selectedResultName, "delete");
		assert.ok(model.selectedResult);
		assert.deepStrictEqual(model.availableResults[1], model.selectedResult);
	});
	it("shows speedy option when relevent result is selected", function() {
		model.setSelectedResultName("keep");
		assert.strictEqual(model.showResultOptions, true, "resultOptions are shown");
		assert.strictEqual(model.showSpeedyResult, true, "speedy option is shown");
	});
	it("hides speedy option when relevent result is no longer selected", function() {
		model.setSelectedResultName("keep");
		model.setSelectedResultName("custom");
		assert.strictEqual(model.showResultOptions, false, "resultOptions are not shown");
		assert.strictEqual(model.showSpeedyResult, false, "speedy option is not shown");
	});
	it("shows soft option when relevent result is selected", function() {
		model.setSelectedResultName("delete");
		assert.strictEqual(model.showResultOptions, true, "resultOptions are shown");
		assert.strictEqual(model.showSoftResult, true, "soft option is shown");
	});
	it("hides soft option when relevent result is no longer selected", function() {
		model.setSelectedResultName("delete");
		model.setSelectedResultName("custom");
		assert.strictEqual(model.showResultOptions, false, "resultOptions are not shown");
		assert.strictEqual(model.showSoftResult, false, "soft option is not shown");
	});
	it("shows delete first option when relevent result is selected", function() {
		model.setSelectedResultName("redirect");
		assert.strictEqual(model.showResultOptions, true, "resultOptions are shown");
		assert.strictEqual(model.showDeleteFirstResult, true, "delete first option is shown");
	});
	it("hides delete first option when relevent result is no longer selected", function() {
		model.setSelectedResultName("redirect");
		model.setSelectedResultName("custom");
		assert.strictEqual(model.showResultOptions, false, "resultOptions are not shown");
		assert.strictEqual(model.showDeleteFirstResult, false, "delete first option is not shown");
	});
	it("shows target input when relevent result is selected", function() {
		model.setSelectedResultName("redirect");
		assert.strictEqual(model.showTarget, true, "target input is shown");
	});
	it("hides target input when relevent result is selected", function() {
		model.setSelectedResultName("redirect");
		model.setSelectedResultName("custom");
		assert.strictEqual(model.showTarget, false, "target input is not shown");
	});
	it("shows custom result input when relevent result is selected", function() {
		model.setSelectedResultName("custom");
		assert.strictEqual(model.showCustomResult, true, "custom result input is shown");
	});
	it("hides custom result input when relevent result is selected", function() {
		model.setSelectedResultName("custom");
		model.setSelectedResultName("keep");
		assert.strictEqual(model.showCustomResult, false, "custom result input is not shown");
	});
	it("has an invalid target initially", function() {
		model.setSelectedResultName("redirect");
		assert.strictEqual(model.targetIsValid, false);
	});
	it("has an invalid target when set to an invalid page name", function() {
		model.setSelectedResultName("redirect");
		model.setTargetPageName("�");
		assert.strictEqual(model.targetIsValid, false);
	});
	it("has a valid target when set to an valid page name", function() {
		model.setSelectedResultName("redirect");
		model.setTargetPageName("Wikipedia:Foo");
		assert.strictEqual(model.targetIsValid, true);
	});
	it("has an invalid custom result initially", function() {
		model.setSelectedResultName("custom");
		assert.strictEqual(model.customResultIsValid, false);
	});
	it("has an invalid custom result when set to whitespace", function() {
		model.setSelectedResultName("custom");
		model.setCustomResultText("  ");
		assert.strictEqual(model.customResultIsValid, false);
	});
	it("has a valid custom result when set to non-whitespace", function() {
		model.setSelectedResultName("custom");
		model.setCustomResultText("Foobaz");
		assert.strictEqual(model.customResultIsValid, true);
	});
	it("unsets other options when setting an option", function() {
		assert.strictEqual(model.speedyResult, false);
		assert.strictEqual(model.softResult, false);
		assert.strictEqual(model.deleteFirstResult, false);
		model.setSpeedyResult(true);
		assert.strictEqual(model.speedyResult, true);
		assert.strictEqual(model.softResult, false);
		assert.strictEqual(model.deleteFirstResult, false);
		model.setSoftResult(true);
		assert.strictEqual(model.speedyResult, false);
		assert.strictEqual(model.softResult, true);
		assert.strictEqual(model.deleteFirstResult, false);
		model.setDeleteFirstResult(true);
		assert.strictEqual(model.speedyResult, false);
		assert.strictEqual(model.softResult, false);
		assert.strictEqual(model.deleteFirstResult, true);
		model.setSpeedyResult(true);
		assert.strictEqual(model.speedyResult, true);
		assert.strictEqual(model.softResult, false);
		assert.strictEqual(model.deleteFirstResult, false);
		model.setSpeedyResult(false);
		assert.strictEqual(model.speedyResult, false);
		assert.strictEqual(model.softResult, false);
		assert.strictEqual(model.deleteFirstResult, false);
	});
	it("formats result text", function() {
		assert.strictEqual(model.getResultText(), "", "Empty initially");

		model.setSelectedResultName("keep");
		assert.equal(model.getResultText(), "keep", "simple result");

		model.setSpeedyResult(true);
		assert.equal(model.getResultText(), "speedy keep", "speedy result");

		model.setSelectedResultName("redirect");
		assert.equal(model.getResultText(), "redirect", "speedy now not applicable result");

		model.setSoftResult(true);
		assert.equal(model.getResultText(), "soft redirect", "soft result");

		model.setDeleteFirstResult(true);
		assert.equal(model.getResultText(), "delete and redirect", "delete first result");
		
		model.setSelectedResultName("custom");
		assert.equal(model.getResultText(), "", "empty custom result");

		model.setCustomResultText("  ");
		assert.equal(model.getResultText(), "", "whitespace custom result");
		
		model.setCustomResultText("Foobaz");
		assert.equal(model.getResultText(), "Foobaz", "valid custom result");

		model.setCustomResultText(" Foobaz  ");
		assert.equal(model.getResultText(), "Foobaz", "leading and trailing whitespace custom result");
	});
	it("formats target", function() {
		model.setSelectedResultName("redirect");
		assert.strictEqual(model.getFormattedTarget(), "", "Empty string if target is empty");

		model.setTargetPageName("�");
		assert.strictEqual(model.getFormattedTarget(), "", "Empty string if target is invalid");

		model.setTargetPageName("Foo");
		assert.strictEqual(model.getFormattedTarget(), "[[Foo]]", "Simple page");

		model.setTargetPageName("Foo  ");
		assert.strictEqual(model.getFormattedTarget(), "[[Foo]]", "Simple page with excess whitespace");

		model.setTargetPageName("Foo#bar");
		assert.strictEqual(model.getFormattedTarget(), "[[Foo#bar]]", "Page with fragment");

		model.setTargetPageName("Foo #bar");
		assert.strictEqual(model.getFormattedTarget(), "[[Foo#bar]]", "Page with whitespace before fragment");

		model.setTargetPageName("Category:Foo");
		assert.strictEqual(model.getFormattedTarget(), "[[:Category:Foo]]", "Namespace requiring a colon page");

		model.setTargetPageName("Image:Foo.ext");
		assert.strictEqual(model.getFormattedTarget(), "[[:File:Foo.ext]]", "Namespace alias Image->File");

		model.setTargetPageName("wikt:word");
		assert.strictEqual(model.getFormattedTarget(), "[[Wikt:word]]", "Interwiki prefix");

		model.setTargetPageName("c:File:foo.jpg");
		assert.strictEqual(model.getFormattedTarget(), "[[C:File:foo.jpg]]", "Interwiki prefix with namespace");
	});
	it("formats raw target", function() {
		model.setSelectedResultName("redirect");
		model.setTargetPageName("");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "", "Empty string if target is empty");

		model.setTargetPageName("�");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "", "Empty string if target is invalid");

		model.setTargetPageName("Foo");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "Foo", "Simple page");

		model.setTargetPageName("Foo  ");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "Foo", "Simple page with excess whitespace");

		model.setTargetPageName("Foo#bar");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "Foo#bar", "Page with fragment");

		model.setTargetPageName("Foo #bar");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "Foo#bar", "Page with whitespace before fragment");

		model.setTargetPageName("Category:Foo");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "Category:Foo", "Namespace");

		model.setTargetPageName("Image:Foo.ext");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "File:Foo.ext", "Namespace alias Image->File");

		model.setTargetPageName("wikt:word");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "Wikt:word", "interwiki prefix");

		model.setTargetPageName("c:File:foo.jpg");
		assert.strictEqual(model.getFormattedTarget({raw: true}), "C:File:foo.jpg", "Interwiki prefix with namespace");
	});
	it("formats \"to\" target", function() {
		model.setSelectedResultName("redirect");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "", "Empty string if target is empty");

		model.setTargetPageName("�");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "", "Empty string if target is invalid");

		model.setTargetPageName("Foo");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "to [[Foo]]", "Simple page");

		model.setTargetPageName("Foo  ");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "to [[Foo]]", "Simple page with excess whitespace");

		model.setTargetPageName("Foo#bar");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "to [[Foo#bar]]", "Page with fragment");

		model.setTargetPageName("Foo #bar");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "to [[Foo#bar]]", "Page with whitespace before fragment");

		model.setTargetPageName("Category:Foo");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "to [[:Category:Foo]]", "Namespace requiring a colon page");

		model.setTargetPageName("Image:Foo.ext");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "to [[:File:Foo.ext]]", "Namespace alias Image->File");

		model.setTargetPageName("wikt:word");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "to [[Wikt:word]]", "Interwiki prefix");

		model.setTargetPageName("c:File:foo.jpg");
		assert.strictEqual(model.getFormattedTarget({prepend: "to "}), "to [[C:File:foo.jpg]]", "Interwiki prefix with namespace");
	});
	it("correctly sets validity", function() {
		assert.strictEqual(model.isValid(), false, "Initially invalid");

		model.setSelectedResultName("keep");
		assert.strictEqual(model.isValid(), true, "Valid with keep result");

		model.setSelectedResultName("redirect");
		assert.strictEqual(model.isValid(), false, "Invalid with redirect result and no target");

		model.setTargetPageName("Bar");
		assert.strictEqual(model.isValid(), true, "Valid with redirect result and valid target");

		model.setSelectedResultName("custom");
		assert.strictEqual(model.isValid(), false, "Invalid with custom result and no custom result text");
		
		model.setCustomResultText("Qux");
		assert.strictEqual(model.isValid(), true, "Valid with custom result and custom result text");
	});
});
