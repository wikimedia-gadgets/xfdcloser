/* eslint-env node, mocha */
import assert from "assert";
import { mw } from "../globals";
import AddToHoldingCell from "../xfdcloser-src/Controllers/Tasks/AddToHoldingCell";
import TaskItem from "../xfdcloser-src/Models/TaskItem";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import Result from "../xfdcloser-src/Models/Result";
import Options from "../xfdcloser-src/Models/Options";
//.import config from "../xfdcloser-src/config";

// Mock widgets
const noop = () => {};
const widgets = {
	field: {
		setLabel: noop,
		setNotices: noop,
		setWarnings: noop,
		setErrors: noop,
	},
	progressbar: {
		setProgress: noop,
		toggle: noop
	},
	emit: noop
};

const holdingCellWikitext = `(section0)
===Tools===
(section1)
===Closing discussions===
(section2)

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Infoboxes====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}
*: {{u|Pigsonthewing}}, a mapping for the params would help for this. I don't know anything about trains, but here's what I've figured out so far:
*{{tfdl|Infobox_K-pop_artist_awards|2020 August 25|section=Template:Infobox K-pop artist awards}} into {{t|Infobox_awards_list}}

====Navigation templates====
*{{tfdl|Symptoms_concerning_nutrition,_metabolism_and_development|2020 August 17|section=Template:Symptoms concerning nutrition, metabolism and development}}
*{{tfdl|Nutritional_pathology|2020 August 17|section=Template:Symptoms concerning nutrition, metabolism and development}}
*Merge into [[Template:National squad]]:
**{{tfdl|Volleyball_national_squad|2020 August 20|section=Template:Volleyball national squad}}
**{{tfdl|National_field_hockey_squad|2020 August 20|section=Template:Volleyball national squad}}
**{{tfdl|National_basketball_squad|2020 August 20|section=Template:Volleyball national squad}}
*Merge into [[Template:National squad no numbers]]:
**{{tfdl|Volleyball_national_squad_no_numbers|2020 August 20|section=Template:Volleyball national squad}}
**{{tfdl|National_basketball_squad_no_numbers|2020 August 20|section=Template:Volleyball national squad}}
***Sanboxes and test cases for merging: [[Module:National squad/sandbox]], [[Template:National squad no numbers/sandbox]] and [[Template:National squad no numbers/testcases]]
*{{tfdl|Cognition,_perception,_emotional_state_and_behaviour_symptoms_and_signs|2020 August 21|section=Template:Cognition, perception, emotional state and behaviour symptoms and signs}}
*{{tfdl|Disorders_of_consciousness|2020 August 21|section=Template:Cognition, perception, emotional state and behaviour symptoms and signs}}
*{{tfdl|Eponymous_medical_signs_for_digestive_system_and_general_abdominal_signs|2020 September 9|section=Template:Eponymous medical signs for digestive system and general abdominal signs}}

====Link templates====
* ''None currently''

====Other====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)
*{{tfdl|Userpage_otheruse|2020 September 18|section=Template:Userpage otheruse}}
*{{tfdl|User_page|2020 September 18|section=Template:Userpage otheruse}}
** Giving this another thought when looking on how to implement this, it might be better to separate functions here. {{tl|User page}} does one thing and {{tl|for}} (which this emulates) does another thing. While I voted to merge these functions, I think this is a better solution. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 17:23, 27 September 2020 (UTC)
*{{tfdl|Legend2|2020 September 17|section=Template:Legend2}}

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)

===To convert===
{{anchor|c}}
Templates for which the consensus is that they ought to be converted to some other format are put here until the conversion is completed.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
* ''None currently''

===To [[Wikipedia:Substitution|substitute]]===
{{anchor|s}}
Templates for which the consensus is that all instances should be substituted (e.g. the template should be merged with the article or is a wrapper for a preferred template) are put here until the substitutions are completed. After this is done, the template is deleted from template space.
<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->

===To orphan===
{{anchor|o}}
These templates are to be deleted, but may still be in use on some pages. Somebody (it doesn't need to be an administrator, anyone can do it) should fix and/or remove significant usages from pages so that the templates can be deleted. Note that simple references to them from Talk: pages should not be removed. Add on bottom and remove from top of list (oldest is on top).

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
Do not use leading zeros in the day.
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Sydney_Trains_color|2020 September 19|section=Sydney Trains templates}}
*{{tfdl|Sydney_Trains_lines|2020 September 19|section=Sydney Trains templates}}
*The first of the above templates has had two links removed by correcting the article or template concerned. All other links are linking to pages which have not been updated for nearly 10 years such as [[User:MrHarper/Railboxes]] which already has a number of red links from previous templates which have been deleted previously. Hence it is believed that the above templates can now be removed without any further action. [[User:Fleet Lists|Fleet Lists]] ([[User talk:Fleet Lists|talk]]) 06:09, 29 September 2020 (UTC)

===Ready for deletion===
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
* ''None currently''
`;

describe("AddToHoldingCell", function() {
	describe("single template", function() {
		let discussion, result, options, model, task;
		beforeEach(function() {
			discussion = new Discussion({
				id: "id",
				venue: Venue.Tfd(),
				pages: ["Template:Foo"].map(t => mw.Title.newFromText(t)),
				discussionPageName: "WP:TFD/discussionPageName",
				sectionHeader: "Foo",
				sectionNumber: 42,
				firstCommentDate: new Date("2020-03-18T12:22Z"),
				isRelisted: false,
				userIsSysop: true
			});
			discussion.nominationDate = discussion.firstCommentDate;
			mw.Title.exist.set(discussion.pages.map(t => t.getPrefixedDb()), true);
			result = new Result({
				discussion,
				type: "close",
				userIsSysop: true
			});
			options = new Options({
				result,
				venue: discussion.venue,
				userIsSysop: true
			});
			result.singleModeResult.setSelectedResultName("delete");
			options.getItems()[0].setSelectedActionName("holdingCell");
			options.getItems()[0].setOptionValue("holdcellSection", "review");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new AddToHoldingCell(model, widgets);
		});
		it("is listed in a section with existing content", function() {
			const transformed = task.transform({content: holdingCellWikitext});
			if ( transformed.then ) {
				transformed.then(console.log, console.warn);
				throw new Error("transform returned a promise");
			}
			assert.deepStrictEqual(["text", "summary"], Object.keys(transformed));
			assert.strictEqual(transformed.summary, model.getEditSummary({prefix: "Listing template:"}));
			const curHeading = "===To review===";
			const nextHeading = "===To merge===";
			assert.strictEqual(holdingCellWikitext.split(curHeading)[0], transformed.text.split(curHeading)[0]);
			assert.strictEqual(holdingCellWikitext.split(nextHeading)[1], transformed.text.split(nextHeading)[1]);
			assert.strictEqual(
				transformed.text.split(curHeading)[1].split(nextHeading)[0],`
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*{{tfdl|Foo|2020 March 18|section=Foo}}

`);
		});
		it("is listed in a section without existing content", function() {
			options.getItems()[0].setOptionValue("holdcellSection", "substitute");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new AddToHoldingCell(model, widgets);
			const transformed = task.transform({content: holdingCellWikitext});
			if ( transformed.then ) {
				transformed.then(console.log, console.warn);
				throw new Error("transform returned a promise");
			}
			assert.deepStrictEqual(["text", "summary"], Object.keys(transformed));
			assert.strictEqual(transformed.summary, model.getEditSummary({prefix: "Listing template:"}));
			const curHeading = "===To [[Wikipedia:Substitution|substitute]]===";
			const nextHeading = "===To orphan===";
			assert.strictEqual(holdingCellWikitext.split(curHeading)[0], transformed.text.split(curHeading)[0]);
			assert.strictEqual(holdingCellWikitext.split(nextHeading)[1], transformed.text.split(nextHeading)[1]);
			assert.strictEqual(
				transformed.text.split(curHeading)[1].split(nextHeading)[0],
				`
{{anchor|s}}
Templates for which the consensus is that all instances should be substituted (e.g. the template should be merged with the article or is a wrapper for a preferred template) are put here until the substitutions are completed. After this is done, the template is deleted from template space.
<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Foo|2020 March 18|section=Foo}}

`);
		});
		it("is listed in a section with a \"None currently\" bullet", function() {
			options.getItems()[0].setOptionValue("holdcellSection", "convert");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new AddToHoldingCell(model, widgets);
			const transformed = task.transform({content: holdingCellWikitext});
			if ( transformed.then ) {
				transformed.then(console.log, console.warn);
				throw new Error("transform returned a promise");
			}
			
			assert.deepStrictEqual(["text", "summary"], Object.keys(transformed));
			assert.strictEqual(transformed.summary, model.getEditSummary({prefix: "Listing template:"}));
			const curHeading = "===To convert===";
			const nextHeading = "===To [[Wikipedia:Substitution|substitute]]===";
			assert.strictEqual(holdingCellWikitext.split(curHeading)[0], transformed.text.split(curHeading)[0]);
			assert.strictEqual(holdingCellWikitext.split(nextHeading)[1], transformed.text.split(nextHeading)[1]);
			assert.strictEqual(
				transformed.text.split(curHeading)[1].split(nextHeading)[0],
				`
{{anchor|c}}
Templates for which the consensus is that they ought to be converted to some other format are put here until the conversion is completed.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Foo|2020 March 18|section=Foo}}

`				);
		});
		it("is listed with the delete param when ready for deletion", function() {
			options.getItems()[0].setOptionValue("holdcellSection", "ready");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new AddToHoldingCell(model, widgets);
			const transformed = task.transform({content: holdingCellWikitext});
			if ( transformed.then ) {
				transformed.then(console.log, console.warn);
				throw new Error("transform returned a promise");
			}

			assert.deepStrictEqual(["text", "summary"], Object.keys(transformed));
			assert.strictEqual(transformed.summary, model.getEditSummary({prefix: "Listing template:"}));
			const curHeading = "===Ready for deletion===";
			assert.strictEqual(holdingCellWikitext.split(curHeading)[0], transformed.text.split(curHeading)[0]);
			assert.strictEqual(
				transformed.text.split(curHeading)[1],
				`
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Foo|2020 March 18|section=Foo|delete=1}}
`);	
		});
	});
	
	describe("multiple templates", function() {
		let discussion, result, options, model, task;
		beforeEach(function() {
			discussion = new Discussion({
				id: "id",
				venue: Venue.Tfd(),
				pages: ["Template:Foo", "Template:Bar"].map(t => mw.Title.newFromText(t)),
				discussionPageName: "WP:TFD/discussionPageName",
				sectionHeader: "Foo",
				sectionNumber: 42,
				firstCommentDate: new Date("2020-03-18T12:22Z"),
				isRelisted: false,
				userIsSysop: true
			});
			discussion.nominationDate = discussion.firstCommentDate;
			mw.Title.exist.set(discussion.pages.map(t => t.getPrefixedDb()), true);
			result = new Result({
				discussion,
				type: "close",
				userIsSysop: true
			});
			options = new Options({
				result,
				venue: discussion.venue,
				userIsSysop: true
			});
			result.singleModeResult.setSelectedResultName("delete");
			options.getItems()[0].setSelectedActionName("holdingCell");
			options.getItems()[0].setOptionValue("holdcellSection", "review");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new AddToHoldingCell(model, widgets);
		});
		it("can both be listed in a section", function() {
			const transformed = task.transform({content: holdingCellWikitext});
			if ( transformed.then ) {
				transformed.then(console.log, console.warn);
				throw new Error("transform returned a promise");
			}

			assert.deepStrictEqual(["text", "summary"], Object.keys(transformed));
			assert.strictEqual(transformed.summary, model.getEditSummary({prefix: "Listing templates:"}));
			const curHeading = "===To review===";
			const nextHeading = "===To merge===";
			assert.strictEqual(holdingCellWikitext.split(curHeading)[0], transformed.text.split(curHeading)[0]);
			assert.strictEqual(holdingCellWikitext.split(nextHeading)[1], transformed.text.split(nextHeading)[1]);
			assert.strictEqual(
				transformed.text.split(curHeading)[1].split(nextHeading)[0],`
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*{{tfdl|Foo|2020 March 18|section=Foo}}
*{{tfdl|Bar|2020 March 18|section=Foo}}

`);
		});
		it("can each be listed in different sections", function() {
			result.setMultimode(true);
			result.multimodeResults.getItems()[0].setSelectedResultName("delete");
			result.multimodeResults.getItems()[1].setSelectedResultName("merge");
			result.setResultSummary("lorem ipsum");
			options.getItems()[0].setSelectedActionName("holdingCell");
			options.getItems()[0].setOptionValue("holdcellSection", "review");
			options.getItems()[1].setSelectedActionName("holdingCellMerge");
			options.getItems()[1].setOptionValue("holdcellMergeSection", "merge-link");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new AddToHoldingCell(model, widgets);
			const transformed = task.transform({content: holdingCellWikitext});
			if ( transformed.then ) {
				transformed.then(console.log, console.warn);
				throw new Error("transform returned a promise");
			}

			assert.deepStrictEqual(["text", "summary"], Object.keys(transformed));
			assert.strictEqual(transformed.summary, model.getEditSummary({prefix: "Listing templates:"}));
			const curHeading1 = "===To review===";
			const nextHeading1 = "===To merge===";
			const curHeading2 = "====Link templates====";
			const nextHeading2 = "====Other====";
			assert.strictEqual(holdingCellWikitext.split(curHeading1)[0], transformed.text.split(curHeading1)[0]);
			assert.strictEqual(holdingCellWikitext.split(nextHeading1)[1].split(curHeading2)[0], transformed.text.split(nextHeading1)[1].split(curHeading2)[0]);
			assert.strictEqual(holdingCellWikitext.split(nextHeading2)[1], transformed.text.split(nextHeading2)[1]);
			assert.strictEqual(
				transformed.text.split(curHeading1)[1].split(nextHeading1)[0],`
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*{{tfdl|Foo|2020 March 18|section=Foo}}

`);
			assert.strictEqual(
				transformed.text.split(curHeading2)[1].split(nextHeading2)[0],`
*{{tfdl|Bar|2020 March 18|section=Foo}}

`);

		});
	});
	describe("module", function() {
		let discussion, result, options, model, task;
		beforeEach(function() {
			discussion = new Discussion({
				id: "id",
				venue: Venue.Tfd(),
				pages: ["Module:Foo"].map(t => mw.Title.newFromText(t)),
				discussionPageName: "WP:TFD/discussionPageName",
				sectionHeader: "Foo",
				sectionNumber: 42,
				firstCommentDate: new Date("2020-03-18T12:22Z"),
				isRelisted: false,
				userIsSysop: true
			});
			discussion.nominationDate = discussion.firstCommentDate;
			mw.Title.exist.set(discussion.pages.map(t => t.getPrefixedDb()), true);
			result = new Result({
				discussion,
				type: "close",
				userIsSysop: true
			});
			options = new Options({
				result,
				venue: discussion.venue,
				userIsSysop: true
			});
			result.singleModeResult.setSelectedResultName("delete");
			options.getItems()[0].setSelectedActionName("holdingCell");
			options.getItems()[0].setOptionValue("holdcellSection", "review");
			model = new TaskItem({
				taskName: "foo",
				relaventPageNames: discussion.pagesNames,
				discussion,
				result,
				options
			});
			task = new AddToHoldingCell(model, widgets);
		});
		it("is listed with the ns param", function() {
			const transformed = task.transform({content: holdingCellWikitext});
			if ( transformed.then ) {
				transformed.then(console.log, console.warn);
				throw new Error("transform returned a promise");
			}

			assert.deepStrictEqual(["text", "summary"], Object.keys(transformed));
			assert.strictEqual(transformed.summary, model.getEditSummary({prefix: "Listing module:"}));
			const curHeading = "===To review===";
			const nextHeading = "===To merge===";
			assert.strictEqual(holdingCellWikitext.split(curHeading)[0], transformed.text.split(curHeading)[0]);
			assert.strictEqual(holdingCellWikitext.split(nextHeading)[1], transformed.text.split(nextHeading)[1]);
			assert.strictEqual(
				transformed.text.split(curHeading)[1].split(nextHeading)[0],`
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*{{tfdl|Foo|2020 March 18|section=Foo|ns=Module}}

`);
		});
	});
});