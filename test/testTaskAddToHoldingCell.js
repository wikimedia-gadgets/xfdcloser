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

const holdingCellWikitext = `<includeonly>{{Transcluded section|source=Wikipedia:Templates for discussion/Holding cell}}
</includeonly><noinclude>{{bots|deny=SineBot}}{{TOC right}}{{Shortcut|WP:TFD/H}}{{Deletion debates}}</noinclude>
{{backlog}}

'''If''' process guidelines are met, move templates to the appropriate subsection '''here''' to prepare to delete. Before deleting a template, ensure that it is not in use on any pages (other than talk pages where eliminating the link would change the meaning of a prior discussion), by checking [[Special:Whatlinkshere]] for '(transclusion)'. Consider placing {{t1|Being deleted}} on the template page.

===Tools===
There are several tools that can help when implementing TfDs. Some of these are listed below. 
*[[Wikipedia:AutoWikiBrowser|AutoWikiBrowser]] – Semi-automatic editor that can replace or modify templates using [[regular expressions]] 
*[[Wikipedia:Bots|Bots]] – Robots editing automatically. All tasks have to be [[WP:BRFA|approved]] before operating. There are currently five bots with general approval to assist with implementing TfD outcomes:
**[[Wikipedia:Bots/Requests for approval/AnomieBOT 78|AnomieBOT]] - substituting templates via [[User:AnomieBOT/TFDTemplateSubster]]
**[[Wikipedia:Bots/Requests for approval/SporkBot|SporkBot]] - general TfD implementation run by [[User:Plastikspork|Plastikspork]]
**[[Wikipedia:Bots/Requests for approval/PrimeBOT 24|PrimeBOT]] - general TfD implementation run by [[User:Primefac|Primefac]]
**[[Wikipedia:Bots/Requests for approval/DannyS712 bot 47|DannyS712 bot]] - template orphaning run by [[User:DannyS712|DannyS712]]
**[[Wikipedia:Bots/Requests for approval/BsherrAWBBOT 2|BsherrAWBBOT]] – general TfD implementation run by [[User:Bsherr|Bsherr]]

===Closing discussions===
The closing procedures are outlined at [[Wikipedia:Templates for discussion/Closing instructions]].

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*::Should be doable, yes. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 00:22, 29 April 2018 (UTC)
*:::I could probably do something while I am converting all the {{tld|Fb team}} templates.  But, I will have to see how complicated the code is.  Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 00:36, 29 April 2018 (UTC)
*::::{{ping|Plastikspork|Primefac}} Can your bots using [[Module:Sports table]] instead in this case, such as [https://en.wikipedia.org/w/index.php?title=User:Twwalter/2011_MLS_table_concept&diff=prev&oldid=838700657]? [[User:Hhhhhkohhhhh|Hhhhhkohhhhh]] ([[User talk:Hhhhhkohhhhh|talk]]) 04:14, 29 April 2018 (UTC)
*:::::[[User:Hhhhhkohhhhh|Hhhhhkohhhhh]], sure.  That particular template only had one use, and that use was in userspace, and the title of the page was "concept", so I didn't bother to fully convert it.  But in general, the plan is to convert the various table/cl header/cl footer/cl team templates to use sports table. Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 12:41, 29 April 2018 (UTC)
*:::::: I am replacing all of these fb templates [[User:Frietjes|Frietjes]] ([[User talk:Frietjes|talk]]) 15:08, 20 February 2019 (UTC)
*Merge into {{t|Aircraft specs}}:
**{{tfdl|Aerospecs|2019 March 20|section=Template:Aerospecs}}
**{{tfdl|Aircraft_specifications|2019 March 20|section=Template:Aerospecs}}
*::There's a discussion about this merger at [[Wikipedia talk:WikiProject Aircraft/Archive_45#Template:Aircraft specs merger bot]] --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 15:52, 8 August 2019 (UTC)
*{{tfdl|Ship_event_row|2020 May 27|section=Ship event row}} and {{tfdl|Ship_builder|2020 May 27|section=Ship event row}}
** These were listed for substing, but look what happens when you do that: [[Special:Diff/960980656]]! Something else should probably be done. --[[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 00:13, 6 June 2020 (UTC)
***Simple subst doesn't really cut it when dealing with parser functions like #if. I've not been working on TFD-related stuff recently but with other projects starting to get finished I'll take a look provided no one else tackles it first. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 21:19, 6 June 2020 (UTC)
****This one is probably best done manually. There's not that many articles affected and I'll work on it over the next couple of weeks. If any other editor wishes to join in feel free. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:35, 9 June 2020 (UTC)
*****{{u|Mdaniels5757}} and {{u|Primefac}} the templates were listed for deprecation, removal and deletion. Shipbuilder is not that big a problem and per my comments at the original nom, it might be kept as it is in use outside of the lists I mention at the original nom. Ship event row is the problem template. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:40, 9 June 2020 (UTC)

===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Arts====
* ''None currently''

====Geography, politics and governance====
*{{tfdl|COVID-19_pandemic_curfews|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}
*{{tfdl|COVID-19_pandemic_lockdowns|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}

====Religion====
* ''None currently''

====Sports====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)

====Transport====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}

====Other====
*{{tfdl|Infobox_war_faction|2020 March 19|section=Template:Infobox war faction}}
*{{tfdl|Infobox_militant_organization|2020 March 19|section=Template:Infobox war faction}}
** In progress [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 17:12, 2 May 2020 (UTC)

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)
* Merge into {{t|Copied}}
** {{tfdl|Copied multi|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Merged-from|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Copied|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Afd-merged-from|2019 August 10|section=Template:Copied multi}}
***Could I claim this merger? I would like to convert this into my first module. It may take some time though since I have zero lua experience. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 18:53, 4 September 2019 (UTC)
****Go for it. Just makes sure you sandbox heavily and maybe have one of us check it before you go live. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 19:09, 4 September 2019 (UTC)
***5 months later and I have actually gotten to doing it. Feedback appreciated at [[Template_talk:Copied#Major update and lua conversion]]. ‑‑[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 19:08, 6 February 2020 (UTC)
*{{tfdl|Basic_example|2020 February 13|section=Module:HelloWorld|ns=Module}} merge with [[Module:Example]]
*{{tfdl|R_to_anchor_2|2020 February 5|section=Template:R to anchor 2}}
*{{tfdl|R_to_anchor|2020 February 5|section=Template:R to anchor 2}}
** What does the "merge" result mean here? SMcCandlish gave two options, either to remove the line that handles the printworthyness or replace it with a parameter. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 09:35, 22 April 2020 (UTC)
*{{tfdl|Shortcut/policy|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut/further|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Timed_block|2020 June 2|section=Template:Timed block}}
*{{tfdl|Uw-block|2020 June 2|section=Template:Timed block}}

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
*''None currently''

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
			assert.deepStrictEqual({
				text: `<includeonly>{{Transcluded section|source=Wikipedia:Templates for discussion/Holding cell}}
</includeonly><noinclude>{{bots|deny=SineBot}}{{TOC right}}{{Shortcut|WP:TFD/H}}{{Deletion debates}}</noinclude>
{{backlog}}

'''If''' process guidelines are met, move templates to the appropriate subsection '''here''' to prepare to delete. Before deleting a template, ensure that it is not in use on any pages (other than talk pages where eliminating the link would change the meaning of a prior discussion), by checking [[Special:Whatlinkshere]] for '(transclusion)'. Consider placing {{t1|Being deleted}} on the template page.

===Tools===
There are several tools that can help when implementing TfDs. Some of these are listed below. 
*[[Wikipedia:AutoWikiBrowser|AutoWikiBrowser]] – Semi-automatic editor that can replace or modify templates using [[regular expressions]] 
*[[Wikipedia:Bots|Bots]] – Robots editing automatically. All tasks have to be [[WP:BRFA|approved]] before operating. There are currently five bots with general approval to assist with implementing TfD outcomes:
**[[Wikipedia:Bots/Requests for approval/AnomieBOT 78|AnomieBOT]] - substituting templates via [[User:AnomieBOT/TFDTemplateSubster]]
**[[Wikipedia:Bots/Requests for approval/SporkBot|SporkBot]] - general TfD implementation run by [[User:Plastikspork|Plastikspork]]
**[[Wikipedia:Bots/Requests for approval/PrimeBOT 24|PrimeBOT]] - general TfD implementation run by [[User:Primefac|Primefac]]
**[[Wikipedia:Bots/Requests for approval/DannyS712 bot 47|DannyS712 bot]] - template orphaning run by [[User:DannyS712|DannyS712]]
**[[Wikipedia:Bots/Requests for approval/BsherrAWBBOT 2|BsherrAWBBOT]] – general TfD implementation run by [[User:Bsherr|Bsherr]]

===Closing discussions===
The closing procedures are outlined at [[Wikipedia:Templates for discussion/Closing instructions]].

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*::Should be doable, yes. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 00:22, 29 April 2018 (UTC)
*:::I could probably do something while I am converting all the {{tld|Fb team}} templates.  But, I will have to see how complicated the code is.  Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 00:36, 29 April 2018 (UTC)
*::::{{ping|Plastikspork|Primefac}} Can your bots using [[Module:Sports table]] instead in this case, such as [https://en.wikipedia.org/w/index.php?title=User:Twwalter/2011_MLS_table_concept&diff=prev&oldid=838700657]? [[User:Hhhhhkohhhhh|Hhhhhkohhhhh]] ([[User talk:Hhhhhkohhhhh|talk]]) 04:14, 29 April 2018 (UTC)
*:::::[[User:Hhhhhkohhhhh|Hhhhhkohhhhh]], sure.  That particular template only had one use, and that use was in userspace, and the title of the page was "concept", so I didn't bother to fully convert it.  But in general, the plan is to convert the various table/cl header/cl footer/cl team templates to use sports table. Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 12:41, 29 April 2018 (UTC)
*:::::: I am replacing all of these fb templates [[User:Frietjes|Frietjes]] ([[User talk:Frietjes|talk]]) 15:08, 20 February 2019 (UTC)
*Merge into {{t|Aircraft specs}}:
**{{tfdl|Aerospecs|2019 March 20|section=Template:Aerospecs}}
**{{tfdl|Aircraft_specifications|2019 March 20|section=Template:Aerospecs}}
*::There's a discussion about this merger at [[Wikipedia talk:WikiProject Aircraft/Archive_45#Template:Aircraft specs merger bot]] --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 15:52, 8 August 2019 (UTC)
*{{tfdl|Ship_event_row|2020 May 27|section=Ship event row}} and {{tfdl|Ship_builder|2020 May 27|section=Ship event row}}
** These were listed for substing, but look what happens when you do that: [[Special:Diff/960980656]]! Something else should probably be done. --[[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 00:13, 6 June 2020 (UTC)
***Simple subst doesn't really cut it when dealing with parser functions like #if. I've not been working on TFD-related stuff recently but with other projects starting to get finished I'll take a look provided no one else tackles it first. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 21:19, 6 June 2020 (UTC)
****This one is probably best done manually. There's not that many articles affected and I'll work on it over the next couple of weeks. If any other editor wishes to join in feel free. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:35, 9 June 2020 (UTC)
*****{{u|Mdaniels5757}} and {{u|Primefac}} the templates were listed for deprecation, removal and deletion. Shipbuilder is not that big a problem and per my comments at the original nom, it might be kept as it is in use outside of the lists I mention at the original nom. Ship event row is the problem template. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:40, 9 June 2020 (UTC)
*{{tfdl|Foo|2020 March 18|section=Foo}}

===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Arts====
* ''None currently''

====Geography, politics and governance====
*{{tfdl|COVID-19_pandemic_curfews|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}
*{{tfdl|COVID-19_pandemic_lockdowns|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}

====Religion====
* ''None currently''

====Sports====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)

====Transport====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}

====Other====
*{{tfdl|Infobox_war_faction|2020 March 19|section=Template:Infobox war faction}}
*{{tfdl|Infobox_militant_organization|2020 March 19|section=Template:Infobox war faction}}
** In progress [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 17:12, 2 May 2020 (UTC)

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)
* Merge into {{t|Copied}}
** {{tfdl|Copied multi|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Merged-from|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Copied|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Afd-merged-from|2019 August 10|section=Template:Copied multi}}
***Could I claim this merger? I would like to convert this into my first module. It may take some time though since I have zero lua experience. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 18:53, 4 September 2019 (UTC)
****Go for it. Just makes sure you sandbox heavily and maybe have one of us check it before you go live. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 19:09, 4 September 2019 (UTC)
***5 months later and I have actually gotten to doing it. Feedback appreciated at [[Template_talk:Copied#Major update and lua conversion]]. ‑‑[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 19:08, 6 February 2020 (UTC)
*{{tfdl|Basic_example|2020 February 13|section=Module:HelloWorld|ns=Module}} merge with [[Module:Example]]
*{{tfdl|R_to_anchor_2|2020 February 5|section=Template:R to anchor 2}}
*{{tfdl|R_to_anchor|2020 February 5|section=Template:R to anchor 2}}
** What does the "merge" result mean here? SMcCandlish gave two options, either to remove the line that handles the printworthyness or replace it with a parameter. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 09:35, 22 April 2020 (UTC)
*{{tfdl|Shortcut/policy|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut/further|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Timed_block|2020 June 2|section=Template:Timed block}}
*{{tfdl|Uw-block|2020 June 2|section=Template:Timed block}}

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
*''None currently''

===Ready for deletion===
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
* ''None currently''
`,
				summary: model.getEditSummary({prefix: "Listing template:"})
			}, transformed);
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
			assert.deepStrictEqual({
				text: `<includeonly>{{Transcluded section|source=Wikipedia:Templates for discussion/Holding cell}}
</includeonly><noinclude>{{bots|deny=SineBot}}{{TOC right}}{{Shortcut|WP:TFD/H}}{{Deletion debates}}</noinclude>
{{backlog}}

'''If''' process guidelines are met, move templates to the appropriate subsection '''here''' to prepare to delete. Before deleting a template, ensure that it is not in use on any pages (other than talk pages where eliminating the link would change the meaning of a prior discussion), by checking [[Special:Whatlinkshere]] for '(transclusion)'. Consider placing {{t1|Being deleted}} on the template page.

===Tools===
There are several tools that can help when implementing TfDs. Some of these are listed below. 
*[[Wikipedia:AutoWikiBrowser|AutoWikiBrowser]] – Semi-automatic editor that can replace or modify templates using [[regular expressions]] 
*[[Wikipedia:Bots|Bots]] – Robots editing automatically. All tasks have to be [[WP:BRFA|approved]] before operating. There are currently five bots with general approval to assist with implementing TfD outcomes:
**[[Wikipedia:Bots/Requests for approval/AnomieBOT 78|AnomieBOT]] - substituting templates via [[User:AnomieBOT/TFDTemplateSubster]]
**[[Wikipedia:Bots/Requests for approval/SporkBot|SporkBot]] - general TfD implementation run by [[User:Plastikspork|Plastikspork]]
**[[Wikipedia:Bots/Requests for approval/PrimeBOT 24|PrimeBOT]] - general TfD implementation run by [[User:Primefac|Primefac]]
**[[Wikipedia:Bots/Requests for approval/DannyS712 bot 47|DannyS712 bot]] - template orphaning run by [[User:DannyS712|DannyS712]]
**[[Wikipedia:Bots/Requests for approval/BsherrAWBBOT 2|BsherrAWBBOT]] – general TfD implementation run by [[User:Bsherr|Bsherr]]

===Closing discussions===
The closing procedures are outlined at [[Wikipedia:Templates for discussion/Closing instructions]].

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*::Should be doable, yes. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 00:22, 29 April 2018 (UTC)
*:::I could probably do something while I am converting all the {{tld|Fb team}} templates.  But, I will have to see how complicated the code is.  Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 00:36, 29 April 2018 (UTC)
*::::{{ping|Plastikspork|Primefac}} Can your bots using [[Module:Sports table]] instead in this case, such as [https://en.wikipedia.org/w/index.php?title=User:Twwalter/2011_MLS_table_concept&diff=prev&oldid=838700657]? [[User:Hhhhhkohhhhh|Hhhhhkohhhhh]] ([[User talk:Hhhhhkohhhhh|talk]]) 04:14, 29 April 2018 (UTC)
*:::::[[User:Hhhhhkohhhhh|Hhhhhkohhhhh]], sure.  That particular template only had one use, and that use was in userspace, and the title of the page was "concept", so I didn't bother to fully convert it.  But in general, the plan is to convert the various table/cl header/cl footer/cl team templates to use sports table. Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 12:41, 29 April 2018 (UTC)
*:::::: I am replacing all of these fb templates [[User:Frietjes|Frietjes]] ([[User talk:Frietjes|talk]]) 15:08, 20 February 2019 (UTC)
*Merge into {{t|Aircraft specs}}:
**{{tfdl|Aerospecs|2019 March 20|section=Template:Aerospecs}}
**{{tfdl|Aircraft_specifications|2019 March 20|section=Template:Aerospecs}}
*::There's a discussion about this merger at [[Wikipedia talk:WikiProject Aircraft/Archive_45#Template:Aircraft specs merger bot]] --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 15:52, 8 August 2019 (UTC)
*{{tfdl|Ship_event_row|2020 May 27|section=Ship event row}} and {{tfdl|Ship_builder|2020 May 27|section=Ship event row}}
** These were listed for substing, but look what happens when you do that: [[Special:Diff/960980656]]! Something else should probably be done. --[[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 00:13, 6 June 2020 (UTC)
***Simple subst doesn't really cut it when dealing with parser functions like #if. I've not been working on TFD-related stuff recently but with other projects starting to get finished I'll take a look provided no one else tackles it first. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 21:19, 6 June 2020 (UTC)
****This one is probably best done manually. There's not that many articles affected and I'll work on it over the next couple of weeks. If any other editor wishes to join in feel free. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:35, 9 June 2020 (UTC)
*****{{u|Mdaniels5757}} and {{u|Primefac}} the templates were listed for deprecation, removal and deletion. Shipbuilder is not that big a problem and per my comments at the original nom, it might be kept as it is in use outside of the lists I mention at the original nom. Ship event row is the problem template. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:40, 9 June 2020 (UTC)

===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Arts====
* ''None currently''

====Geography, politics and governance====
*{{tfdl|COVID-19_pandemic_curfews|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}
*{{tfdl|COVID-19_pandemic_lockdowns|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}

====Religion====
* ''None currently''

====Sports====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)

====Transport====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}

====Other====
*{{tfdl|Infobox_war_faction|2020 March 19|section=Template:Infobox war faction}}
*{{tfdl|Infobox_militant_organization|2020 March 19|section=Template:Infobox war faction}}
** In progress [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 17:12, 2 May 2020 (UTC)

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)
* Merge into {{t|Copied}}
** {{tfdl|Copied multi|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Merged-from|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Copied|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Afd-merged-from|2019 August 10|section=Template:Copied multi}}
***Could I claim this merger? I would like to convert this into my first module. It may take some time though since I have zero lua experience. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 18:53, 4 September 2019 (UTC)
****Go for it. Just makes sure you sandbox heavily and maybe have one of us check it before you go live. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 19:09, 4 September 2019 (UTC)
***5 months later and I have actually gotten to doing it. Feedback appreciated at [[Template_talk:Copied#Major update and lua conversion]]. ‑‑[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 19:08, 6 February 2020 (UTC)
*{{tfdl|Basic_example|2020 February 13|section=Module:HelloWorld|ns=Module}} merge with [[Module:Example]]
*{{tfdl|R_to_anchor_2|2020 February 5|section=Template:R to anchor 2}}
*{{tfdl|R_to_anchor|2020 February 5|section=Template:R to anchor 2}}
** What does the "merge" result mean here? SMcCandlish gave two options, either to remove the line that handles the printworthyness or replace it with a parameter. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 09:35, 22 April 2020 (UTC)
*{{tfdl|Shortcut/policy|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut/further|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Timed_block|2020 June 2|section=Template:Timed block}}
*{{tfdl|Uw-block|2020 June 2|section=Template:Timed block}}

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
*{{tfdl|Foo|2020 March 18|section=Foo}}

===To orphan===
{{anchor|o}}
These templates are to be deleted, but may still be in use on some pages. Somebody (it doesn't need to be an administrator, anyone can do it) should fix and/or remove significant usages from pages so that the templates can be deleted. Note that simple references to them from Talk: pages should not be removed. Add on bottom and remove from top of list (oldest is on top).

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
Do not use leading zeros in the day.
If empty, add * ''None currently'' below this comment. -->
*''None currently''

===Ready for deletion===
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
* ''None currently''
`,
				summary: model.getEditSummary({prefix: "Listing template:"})
			}, transformed);
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
			assert.deepStrictEqual({
				text: `<includeonly>{{Transcluded section|source=Wikipedia:Templates for discussion/Holding cell}}
</includeonly><noinclude>{{bots|deny=SineBot}}{{TOC right}}{{Shortcut|WP:TFD/H}}{{Deletion debates}}</noinclude>
{{backlog}}

'''If''' process guidelines are met, move templates to the appropriate subsection '''here''' to prepare to delete. Before deleting a template, ensure that it is not in use on any pages (other than talk pages where eliminating the link would change the meaning of a prior discussion), by checking [[Special:Whatlinkshere]] for '(transclusion)'. Consider placing {{t1|Being deleted}} on the template page.

===Tools===
There are several tools that can help when implementing TfDs. Some of these are listed below. 
*[[Wikipedia:AutoWikiBrowser|AutoWikiBrowser]] – Semi-automatic editor that can replace or modify templates using [[regular expressions]] 
*[[Wikipedia:Bots|Bots]] – Robots editing automatically. All tasks have to be [[WP:BRFA|approved]] before operating. There are currently five bots with general approval to assist with implementing TfD outcomes:
**[[Wikipedia:Bots/Requests for approval/AnomieBOT 78|AnomieBOT]] - substituting templates via [[User:AnomieBOT/TFDTemplateSubster]]
**[[Wikipedia:Bots/Requests for approval/SporkBot|SporkBot]] - general TfD implementation run by [[User:Plastikspork|Plastikspork]]
**[[Wikipedia:Bots/Requests for approval/PrimeBOT 24|PrimeBOT]] - general TfD implementation run by [[User:Primefac|Primefac]]
**[[Wikipedia:Bots/Requests for approval/DannyS712 bot 47|DannyS712 bot]] - template orphaning run by [[User:DannyS712|DannyS712]]
**[[Wikipedia:Bots/Requests for approval/BsherrAWBBOT 2|BsherrAWBBOT]] – general TfD implementation run by [[User:Bsherr|Bsherr]]

===Closing discussions===
The closing procedures are outlined at [[Wikipedia:Templates for discussion/Closing instructions]].

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*::Should be doable, yes. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 00:22, 29 April 2018 (UTC)
*:::I could probably do something while I am converting all the {{tld|Fb team}} templates.  But, I will have to see how complicated the code is.  Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 00:36, 29 April 2018 (UTC)
*::::{{ping|Plastikspork|Primefac}} Can your bots using [[Module:Sports table]] instead in this case, such as [https://en.wikipedia.org/w/index.php?title=User:Twwalter/2011_MLS_table_concept&diff=prev&oldid=838700657]? [[User:Hhhhhkohhhhh|Hhhhhkohhhhh]] ([[User talk:Hhhhhkohhhhh|talk]]) 04:14, 29 April 2018 (UTC)
*:::::[[User:Hhhhhkohhhhh|Hhhhhkohhhhh]], sure.  That particular template only had one use, and that use was in userspace, and the title of the page was "concept", so I didn't bother to fully convert it.  But in general, the plan is to convert the various table/cl header/cl footer/cl team templates to use sports table. Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 12:41, 29 April 2018 (UTC)
*:::::: I am replacing all of these fb templates [[User:Frietjes|Frietjes]] ([[User talk:Frietjes|talk]]) 15:08, 20 February 2019 (UTC)
*Merge into {{t|Aircraft specs}}:
**{{tfdl|Aerospecs|2019 March 20|section=Template:Aerospecs}}
**{{tfdl|Aircraft_specifications|2019 March 20|section=Template:Aerospecs}}
*::There's a discussion about this merger at [[Wikipedia talk:WikiProject Aircraft/Archive_45#Template:Aircraft specs merger bot]] --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 15:52, 8 August 2019 (UTC)
*{{tfdl|Ship_event_row|2020 May 27|section=Ship event row}} and {{tfdl|Ship_builder|2020 May 27|section=Ship event row}}
** These were listed for substing, but look what happens when you do that: [[Special:Diff/960980656]]! Something else should probably be done. --[[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 00:13, 6 June 2020 (UTC)
***Simple subst doesn't really cut it when dealing with parser functions like #if. I've not been working on TFD-related stuff recently but with other projects starting to get finished I'll take a look provided no one else tackles it first. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 21:19, 6 June 2020 (UTC)
****This one is probably best done manually. There's not that many articles affected and I'll work on it over the next couple of weeks. If any other editor wishes to join in feel free. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:35, 9 June 2020 (UTC)
*****{{u|Mdaniels5757}} and {{u|Primefac}} the templates were listed for deprecation, removal and deletion. Shipbuilder is not that big a problem and per my comments at the original nom, it might be kept as it is in use outside of the lists I mention at the original nom. Ship event row is the problem template. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:40, 9 June 2020 (UTC)

===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Arts====
* ''None currently''

====Geography, politics and governance====
*{{tfdl|COVID-19_pandemic_curfews|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}
*{{tfdl|COVID-19_pandemic_lockdowns|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}

====Religion====
* ''None currently''

====Sports====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)

====Transport====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}

====Other====
*{{tfdl|Infobox_war_faction|2020 March 19|section=Template:Infobox war faction}}
*{{tfdl|Infobox_militant_organization|2020 March 19|section=Template:Infobox war faction}}
** In progress [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 17:12, 2 May 2020 (UTC)

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)
* Merge into {{t|Copied}}
** {{tfdl|Copied multi|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Merged-from|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Copied|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Afd-merged-from|2019 August 10|section=Template:Copied multi}}
***Could I claim this merger? I would like to convert this into my first module. It may take some time though since I have zero lua experience. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 18:53, 4 September 2019 (UTC)
****Go for it. Just makes sure you sandbox heavily and maybe have one of us check it before you go live. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 19:09, 4 September 2019 (UTC)
***5 months later and I have actually gotten to doing it. Feedback appreciated at [[Template_talk:Copied#Major update and lua conversion]]. ‑‑[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 19:08, 6 February 2020 (UTC)
*{{tfdl|Basic_example|2020 February 13|section=Module:HelloWorld|ns=Module}} merge with [[Module:Example]]
*{{tfdl|R_to_anchor_2|2020 February 5|section=Template:R to anchor 2}}
*{{tfdl|R_to_anchor|2020 February 5|section=Template:R to anchor 2}}
** What does the "merge" result mean here? SMcCandlish gave two options, either to remove the line that handles the printworthyness or replace it with a parameter. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 09:35, 22 April 2020 (UTC)
*{{tfdl|Shortcut/policy|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut/further|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Timed_block|2020 June 2|section=Template:Timed block}}
*{{tfdl|Uw-block|2020 June 2|section=Template:Timed block}}

===To convert===
{{anchor|c}}
Templates for which the consensus is that they ought to be converted to some other format are put here until the conversion is completed.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Foo|2020 March 18|section=Foo}}

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
*''None currently''

===Ready for deletion===
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
* ''None currently''
`,
				summary: model.getEditSummary({prefix: "Listing template:"})
			}, transformed);
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
			assert.deepStrictEqual({
				text: `<includeonly>{{Transcluded section|source=Wikipedia:Templates for discussion/Holding cell}}
</includeonly><noinclude>{{bots|deny=SineBot}}{{TOC right}}{{Shortcut|WP:TFD/H}}{{Deletion debates}}</noinclude>
{{backlog}}

'''If''' process guidelines are met, move templates to the appropriate subsection '''here''' to prepare to delete. Before deleting a template, ensure that it is not in use on any pages (other than talk pages where eliminating the link would change the meaning of a prior discussion), by checking [[Special:Whatlinkshere]] for '(transclusion)'. Consider placing {{t1|Being deleted}} on the template page.

===Tools===
There are several tools that can help when implementing TfDs. Some of these are listed below. 
*[[Wikipedia:AutoWikiBrowser|AutoWikiBrowser]] – Semi-automatic editor that can replace or modify templates using [[regular expressions]] 
*[[Wikipedia:Bots|Bots]] – Robots editing automatically. All tasks have to be [[WP:BRFA|approved]] before operating. There are currently five bots with general approval to assist with implementing TfD outcomes:
**[[Wikipedia:Bots/Requests for approval/AnomieBOT 78|AnomieBOT]] - substituting templates via [[User:AnomieBOT/TFDTemplateSubster]]
**[[Wikipedia:Bots/Requests for approval/SporkBot|SporkBot]] - general TfD implementation run by [[User:Plastikspork|Plastikspork]]
**[[Wikipedia:Bots/Requests for approval/PrimeBOT 24|PrimeBOT]] - general TfD implementation run by [[User:Primefac|Primefac]]
**[[Wikipedia:Bots/Requests for approval/DannyS712 bot 47|DannyS712 bot]] - template orphaning run by [[User:DannyS712|DannyS712]]
**[[Wikipedia:Bots/Requests for approval/BsherrAWBBOT 2|BsherrAWBBOT]] – general TfD implementation run by [[User:Bsherr|Bsherr]]

===Closing discussions===
The closing procedures are outlined at [[Wikipedia:Templates for discussion/Closing instructions]].

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*::Should be doable, yes. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 00:22, 29 April 2018 (UTC)
*:::I could probably do something while I am converting all the {{tld|Fb team}} templates.  But, I will have to see how complicated the code is.  Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 00:36, 29 April 2018 (UTC)
*::::{{ping|Plastikspork|Primefac}} Can your bots using [[Module:Sports table]] instead in this case, such as [https://en.wikipedia.org/w/index.php?title=User:Twwalter/2011_MLS_table_concept&diff=prev&oldid=838700657]? [[User:Hhhhhkohhhhh|Hhhhhkohhhhh]] ([[User talk:Hhhhhkohhhhh|talk]]) 04:14, 29 April 2018 (UTC)
*:::::[[User:Hhhhhkohhhhh|Hhhhhkohhhhh]], sure.  That particular template only had one use, and that use was in userspace, and the title of the page was "concept", so I didn't bother to fully convert it.  But in general, the plan is to convert the various table/cl header/cl footer/cl team templates to use sports table. Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 12:41, 29 April 2018 (UTC)
*:::::: I am replacing all of these fb templates [[User:Frietjes|Frietjes]] ([[User talk:Frietjes|talk]]) 15:08, 20 February 2019 (UTC)
*Merge into {{t|Aircraft specs}}:
**{{tfdl|Aerospecs|2019 March 20|section=Template:Aerospecs}}
**{{tfdl|Aircraft_specifications|2019 March 20|section=Template:Aerospecs}}
*::There's a discussion about this merger at [[Wikipedia talk:WikiProject Aircraft/Archive_45#Template:Aircraft specs merger bot]] --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 15:52, 8 August 2019 (UTC)
*{{tfdl|Ship_event_row|2020 May 27|section=Ship event row}} and {{tfdl|Ship_builder|2020 May 27|section=Ship event row}}
** These were listed for substing, but look what happens when you do that: [[Special:Diff/960980656]]! Something else should probably be done. --[[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 00:13, 6 June 2020 (UTC)
***Simple subst doesn't really cut it when dealing with parser functions like #if. I've not been working on TFD-related stuff recently but with other projects starting to get finished I'll take a look provided no one else tackles it first. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 21:19, 6 June 2020 (UTC)
****This one is probably best done manually. There's not that many articles affected and I'll work on it over the next couple of weeks. If any other editor wishes to join in feel free. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:35, 9 June 2020 (UTC)
*****{{u|Mdaniels5757}} and {{u|Primefac}} the templates were listed for deprecation, removal and deletion. Shipbuilder is not that big a problem and per my comments at the original nom, it might be kept as it is in use outside of the lists I mention at the original nom. Ship event row is the problem template. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:40, 9 June 2020 (UTC)

===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Arts====
* ''None currently''

====Geography, politics and governance====
*{{tfdl|COVID-19_pandemic_curfews|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}
*{{tfdl|COVID-19_pandemic_lockdowns|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}

====Religion====
* ''None currently''

====Sports====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)

====Transport====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}

====Other====
*{{tfdl|Infobox_war_faction|2020 March 19|section=Template:Infobox war faction}}
*{{tfdl|Infobox_militant_organization|2020 March 19|section=Template:Infobox war faction}}
** In progress [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 17:12, 2 May 2020 (UTC)

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)
* Merge into {{t|Copied}}
** {{tfdl|Copied multi|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Merged-from|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Copied|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Afd-merged-from|2019 August 10|section=Template:Copied multi}}
***Could I claim this merger? I would like to convert this into my first module. It may take some time though since I have zero lua experience. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 18:53, 4 September 2019 (UTC)
****Go for it. Just makes sure you sandbox heavily and maybe have one of us check it before you go live. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 19:09, 4 September 2019 (UTC)
***5 months later and I have actually gotten to doing it. Feedback appreciated at [[Template_talk:Copied#Major update and lua conversion]]. ‑‑[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 19:08, 6 February 2020 (UTC)
*{{tfdl|Basic_example|2020 February 13|section=Module:HelloWorld|ns=Module}} merge with [[Module:Example]]
*{{tfdl|R_to_anchor_2|2020 February 5|section=Template:R to anchor 2}}
*{{tfdl|R_to_anchor|2020 February 5|section=Template:R to anchor 2}}
** What does the "merge" result mean here? SMcCandlish gave two options, either to remove the line that handles the printworthyness or replace it with a parameter. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 09:35, 22 April 2020 (UTC)
*{{tfdl|Shortcut/policy|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut/further|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Timed_block|2020 June 2|section=Template:Timed block}}
*{{tfdl|Uw-block|2020 June 2|section=Template:Timed block}}

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
*''None currently''

===Ready for deletion===
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Foo|2020 March 18|section=Foo|delete=1}}
`,
				summary: model.getEditSummary({prefix: "Listing template:"})
			}, transformed);	
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
			assert.deepStrictEqual({
				text: `<includeonly>{{Transcluded section|source=Wikipedia:Templates for discussion/Holding cell}}
</includeonly><noinclude>{{bots|deny=SineBot}}{{TOC right}}{{Shortcut|WP:TFD/H}}{{Deletion debates}}</noinclude>
{{backlog}}

'''If''' process guidelines are met, move templates to the appropriate subsection '''here''' to prepare to delete. Before deleting a template, ensure that it is not in use on any pages (other than talk pages where eliminating the link would change the meaning of a prior discussion), by checking [[Special:Whatlinkshere]] for '(transclusion)'. Consider placing {{t1|Being deleted}} on the template page.

===Tools===
There are several tools that can help when implementing TfDs. Some of these are listed below. 
*[[Wikipedia:AutoWikiBrowser|AutoWikiBrowser]] – Semi-automatic editor that can replace or modify templates using [[regular expressions]] 
*[[Wikipedia:Bots|Bots]] – Robots editing automatically. All tasks have to be [[WP:BRFA|approved]] before operating. There are currently five bots with general approval to assist with implementing TfD outcomes:
**[[Wikipedia:Bots/Requests for approval/AnomieBOT 78|AnomieBOT]] - substituting templates via [[User:AnomieBOT/TFDTemplateSubster]]
**[[Wikipedia:Bots/Requests for approval/SporkBot|SporkBot]] - general TfD implementation run by [[User:Plastikspork|Plastikspork]]
**[[Wikipedia:Bots/Requests for approval/PrimeBOT 24|PrimeBOT]] - general TfD implementation run by [[User:Primefac|Primefac]]
**[[Wikipedia:Bots/Requests for approval/DannyS712 bot 47|DannyS712 bot]] - template orphaning run by [[User:DannyS712|DannyS712]]
**[[Wikipedia:Bots/Requests for approval/BsherrAWBBOT 2|BsherrAWBBOT]] – general TfD implementation run by [[User:Bsherr|Bsherr]]

===Closing discussions===
The closing procedures are outlined at [[Wikipedia:Templates for discussion/Closing instructions]].

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*::Should be doable, yes. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 00:22, 29 April 2018 (UTC)
*:::I could probably do something while I am converting all the {{tld|Fb team}} templates.  But, I will have to see how complicated the code is.  Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 00:36, 29 April 2018 (UTC)
*::::{{ping|Plastikspork|Primefac}} Can your bots using [[Module:Sports table]] instead in this case, such as [https://en.wikipedia.org/w/index.php?title=User:Twwalter/2011_MLS_table_concept&diff=prev&oldid=838700657]? [[User:Hhhhhkohhhhh|Hhhhhkohhhhh]] ([[User talk:Hhhhhkohhhhh|talk]]) 04:14, 29 April 2018 (UTC)
*:::::[[User:Hhhhhkohhhhh|Hhhhhkohhhhh]], sure.  That particular template only had one use, and that use was in userspace, and the title of the page was "concept", so I didn't bother to fully convert it.  But in general, the plan is to convert the various table/cl header/cl footer/cl team templates to use sports table. Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 12:41, 29 April 2018 (UTC)
*:::::: I am replacing all of these fb templates [[User:Frietjes|Frietjes]] ([[User talk:Frietjes|talk]]) 15:08, 20 February 2019 (UTC)
*Merge into {{t|Aircraft specs}}:
**{{tfdl|Aerospecs|2019 March 20|section=Template:Aerospecs}}
**{{tfdl|Aircraft_specifications|2019 March 20|section=Template:Aerospecs}}
*::There's a discussion about this merger at [[Wikipedia talk:WikiProject Aircraft/Archive_45#Template:Aircraft specs merger bot]] --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 15:52, 8 August 2019 (UTC)
*{{tfdl|Ship_event_row|2020 May 27|section=Ship event row}} and {{tfdl|Ship_builder|2020 May 27|section=Ship event row}}
** These were listed for substing, but look what happens when you do that: [[Special:Diff/960980656]]! Something else should probably be done. --[[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 00:13, 6 June 2020 (UTC)
***Simple subst doesn't really cut it when dealing with parser functions like #if. I've not been working on TFD-related stuff recently but with other projects starting to get finished I'll take a look provided no one else tackles it first. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 21:19, 6 June 2020 (UTC)
****This one is probably best done manually. There's not that many articles affected and I'll work on it over the next couple of weeks. If any other editor wishes to join in feel free. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:35, 9 June 2020 (UTC)
*****{{u|Mdaniels5757}} and {{u|Primefac}} the templates were listed for deprecation, removal and deletion. Shipbuilder is not that big a problem and per my comments at the original nom, it might be kept as it is in use outside of the lists I mention at the original nom. Ship event row is the problem template. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:40, 9 June 2020 (UTC)
*{{tfdl|Foo|2020 March 18|section=Foo}}
*{{tfdl|Bar|2020 March 18|section=Foo}}

===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Arts====
* ''None currently''

====Geography, politics and governance====
*{{tfdl|COVID-19_pandemic_curfews|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}
*{{tfdl|COVID-19_pandemic_lockdowns|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}

====Religion====
* ''None currently''

====Sports====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)

====Transport====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}

====Other====
*{{tfdl|Infobox_war_faction|2020 March 19|section=Template:Infobox war faction}}
*{{tfdl|Infobox_militant_organization|2020 March 19|section=Template:Infobox war faction}}
** In progress [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 17:12, 2 May 2020 (UTC)

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)
* Merge into {{t|Copied}}
** {{tfdl|Copied multi|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Merged-from|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Copied|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Afd-merged-from|2019 August 10|section=Template:Copied multi}}
***Could I claim this merger? I would like to convert this into my first module. It may take some time though since I have zero lua experience. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 18:53, 4 September 2019 (UTC)
****Go for it. Just makes sure you sandbox heavily and maybe have one of us check it before you go live. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 19:09, 4 September 2019 (UTC)
***5 months later and I have actually gotten to doing it. Feedback appreciated at [[Template_talk:Copied#Major update and lua conversion]]. ‑‑[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 19:08, 6 February 2020 (UTC)
*{{tfdl|Basic_example|2020 February 13|section=Module:HelloWorld|ns=Module}} merge with [[Module:Example]]
*{{tfdl|R_to_anchor_2|2020 February 5|section=Template:R to anchor 2}}
*{{tfdl|R_to_anchor|2020 February 5|section=Template:R to anchor 2}}
** What does the "merge" result mean here? SMcCandlish gave two options, either to remove the line that handles the printworthyness or replace it with a parameter. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 09:35, 22 April 2020 (UTC)
*{{tfdl|Shortcut/policy|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut/further|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Timed_block|2020 June 2|section=Template:Timed block}}
*{{tfdl|Uw-block|2020 June 2|section=Template:Timed block}}

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
*''None currently''

===Ready for deletion===
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
* ''None currently''
`,
				summary: model.getEditSummary({prefix: "Listing templates:"})
			}, transformed);
		});
		it("can each be listed in different sections", function() {
			result.setMultimode(true);
			result.multimodeResults.getItems()[0].setSelectedResultName("delete");
			result.multimodeResults.getItems()[1].setSelectedResultName("merge");
			result.setResultSummary("lorem ipsum");
			options.getItems()[0].setSelectedActionName("holdingCell");
			options.getItems()[0].setOptionValue("holdcellSection", "review");
			options.getItems()[1].setSelectedActionName("holdingCellMerge");
			options.getItems()[1].setOptionValue("holdcellMergeSection", "merge-arts");
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
			assert.deepStrictEqual({
				text: `<includeonly>{{Transcluded section|source=Wikipedia:Templates for discussion/Holding cell}}
</includeonly><noinclude>{{bots|deny=SineBot}}{{TOC right}}{{Shortcut|WP:TFD/H}}{{Deletion debates}}</noinclude>
{{backlog}}

'''If''' process guidelines are met, move templates to the appropriate subsection '''here''' to prepare to delete. Before deleting a template, ensure that it is not in use on any pages (other than talk pages where eliminating the link would change the meaning of a prior discussion), by checking [[Special:Whatlinkshere]] for '(transclusion)'. Consider placing {{t1|Being deleted}} on the template page.

===Tools===
There are several tools that can help when implementing TfDs. Some of these are listed below. 
*[[Wikipedia:AutoWikiBrowser|AutoWikiBrowser]] – Semi-automatic editor that can replace or modify templates using [[regular expressions]] 
*[[Wikipedia:Bots|Bots]] – Robots editing automatically. All tasks have to be [[WP:BRFA|approved]] before operating. There are currently five bots with general approval to assist with implementing TfD outcomes:
**[[Wikipedia:Bots/Requests for approval/AnomieBOT 78|AnomieBOT]] - substituting templates via [[User:AnomieBOT/TFDTemplateSubster]]
**[[Wikipedia:Bots/Requests for approval/SporkBot|SporkBot]] - general TfD implementation run by [[User:Plastikspork|Plastikspork]]
**[[Wikipedia:Bots/Requests for approval/PrimeBOT 24|PrimeBOT]] - general TfD implementation run by [[User:Primefac|Primefac]]
**[[Wikipedia:Bots/Requests for approval/DannyS712 bot 47|DannyS712 bot]] - template orphaning run by [[User:DannyS712|DannyS712]]
**[[Wikipedia:Bots/Requests for approval/BsherrAWBBOT 2|BsherrAWBBOT]] – general TfD implementation run by [[User:Bsherr|Bsherr]]

===Closing discussions===
The closing procedures are outlined at [[Wikipedia:Templates for discussion/Closing instructions]].

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*::Should be doable, yes. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 00:22, 29 April 2018 (UTC)
*:::I could probably do something while I am converting all the {{tld|Fb team}} templates.  But, I will have to see how complicated the code is.  Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 00:36, 29 April 2018 (UTC)
*::::{{ping|Plastikspork|Primefac}} Can your bots using [[Module:Sports table]] instead in this case, such as [https://en.wikipedia.org/w/index.php?title=User:Twwalter/2011_MLS_table_concept&diff=prev&oldid=838700657]? [[User:Hhhhhkohhhhh|Hhhhhkohhhhh]] ([[User talk:Hhhhhkohhhhh|talk]]) 04:14, 29 April 2018 (UTC)
*:::::[[User:Hhhhhkohhhhh|Hhhhhkohhhhh]], sure.  That particular template only had one use, and that use was in userspace, and the title of the page was "concept", so I didn't bother to fully convert it.  But in general, the plan is to convert the various table/cl header/cl footer/cl team templates to use sports table. Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 12:41, 29 April 2018 (UTC)
*:::::: I am replacing all of these fb templates [[User:Frietjes|Frietjes]] ([[User talk:Frietjes|talk]]) 15:08, 20 February 2019 (UTC)
*Merge into {{t|Aircraft specs}}:
**{{tfdl|Aerospecs|2019 March 20|section=Template:Aerospecs}}
**{{tfdl|Aircraft_specifications|2019 March 20|section=Template:Aerospecs}}
*::There's a discussion about this merger at [[Wikipedia talk:WikiProject Aircraft/Archive_45#Template:Aircraft specs merger bot]] --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 15:52, 8 August 2019 (UTC)
*{{tfdl|Ship_event_row|2020 May 27|section=Ship event row}} and {{tfdl|Ship_builder|2020 May 27|section=Ship event row}}
** These were listed for substing, but look what happens when you do that: [[Special:Diff/960980656]]! Something else should probably be done. --[[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 00:13, 6 June 2020 (UTC)
***Simple subst doesn't really cut it when dealing with parser functions like #if. I've not been working on TFD-related stuff recently but with other projects starting to get finished I'll take a look provided no one else tackles it first. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 21:19, 6 June 2020 (UTC)
****This one is probably best done manually. There's not that many articles affected and I'll work on it over the next couple of weeks. If any other editor wishes to join in feel free. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:35, 9 June 2020 (UTC)
*****{{u|Mdaniels5757}} and {{u|Primefac}} the templates were listed for deprecation, removal and deletion. Shipbuilder is not that big a problem and per my comments at the original nom, it might be kept as it is in use outside of the lists I mention at the original nom. Ship event row is the problem template. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:40, 9 June 2020 (UTC)
*{{tfdl|Foo|2020 March 18|section=Foo}}

===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Arts====
*{{tfdl|Bar|2020 March 18|section=Foo}}

====Geography, politics and governance====
*{{tfdl|COVID-19_pandemic_curfews|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}
*{{tfdl|COVID-19_pandemic_lockdowns|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}

====Religion====
* ''None currently''

====Sports====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)

====Transport====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}

====Other====
*{{tfdl|Infobox_war_faction|2020 March 19|section=Template:Infobox war faction}}
*{{tfdl|Infobox_militant_organization|2020 March 19|section=Template:Infobox war faction}}
** In progress [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 17:12, 2 May 2020 (UTC)

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)
* Merge into {{t|Copied}}
** {{tfdl|Copied multi|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Merged-from|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Copied|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Afd-merged-from|2019 August 10|section=Template:Copied multi}}
***Could I claim this merger? I would like to convert this into my first module. It may take some time though since I have zero lua experience. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 18:53, 4 September 2019 (UTC)
****Go for it. Just makes sure you sandbox heavily and maybe have one of us check it before you go live. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 19:09, 4 September 2019 (UTC)
***5 months later and I have actually gotten to doing it. Feedback appreciated at [[Template_talk:Copied#Major update and lua conversion]]. ‑‑[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 19:08, 6 February 2020 (UTC)
*{{tfdl|Basic_example|2020 February 13|section=Module:HelloWorld|ns=Module}} merge with [[Module:Example]]
*{{tfdl|R_to_anchor_2|2020 February 5|section=Template:R to anchor 2}}
*{{tfdl|R_to_anchor|2020 February 5|section=Template:R to anchor 2}}
** What does the "merge" result mean here? SMcCandlish gave two options, either to remove the line that handles the printworthyness or replace it with a parameter. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 09:35, 22 April 2020 (UTC)
*{{tfdl|Shortcut/policy|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut/further|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Timed_block|2020 June 2|section=Template:Timed block}}
*{{tfdl|Uw-block|2020 June 2|section=Template:Timed block}}

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
*''None currently''

===Ready for deletion===
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
* ''None currently''
`,
				summary: model.getEditSummary({prefix: "Listing templates:"})
			}, transformed);
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
			assert.deepStrictEqual({
				text: `<includeonly>{{Transcluded section|source=Wikipedia:Templates for discussion/Holding cell}}
</includeonly><noinclude>{{bots|deny=SineBot}}{{TOC right}}{{Shortcut|WP:TFD/H}}{{Deletion debates}}</noinclude>
{{backlog}}

'''If''' process guidelines are met, move templates to the appropriate subsection '''here''' to prepare to delete. Before deleting a template, ensure that it is not in use on any pages (other than talk pages where eliminating the link would change the meaning of a prior discussion), by checking [[Special:Whatlinkshere]] for '(transclusion)'. Consider placing {{t1|Being deleted}} on the template page.

===Tools===
There are several tools that can help when implementing TfDs. Some of these are listed below. 
*[[Wikipedia:AutoWikiBrowser|AutoWikiBrowser]] – Semi-automatic editor that can replace or modify templates using [[regular expressions]] 
*[[Wikipedia:Bots|Bots]] – Robots editing automatically. All tasks have to be [[WP:BRFA|approved]] before operating. There are currently five bots with general approval to assist with implementing TfD outcomes:
**[[Wikipedia:Bots/Requests for approval/AnomieBOT 78|AnomieBOT]] - substituting templates via [[User:AnomieBOT/TFDTemplateSubster]]
**[[Wikipedia:Bots/Requests for approval/SporkBot|SporkBot]] - general TfD implementation run by [[User:Plastikspork|Plastikspork]]
**[[Wikipedia:Bots/Requests for approval/PrimeBOT 24|PrimeBOT]] - general TfD implementation run by [[User:Primefac|Primefac]]
**[[Wikipedia:Bots/Requests for approval/DannyS712 bot 47|DannyS712 bot]] - template orphaning run by [[User:DannyS712|DannyS712]]
**[[Wikipedia:Bots/Requests for approval/BsherrAWBBOT 2|BsherrAWBBOT]] – general TfD implementation run by [[User:Bsherr|Bsherr]]

===Closing discussions===
The closing procedures are outlined at [[Wikipedia:Templates for discussion/Closing instructions]].

===To review===
{{anchor|r}}
Templates for which each transclusion requires individual attention and analysis before the template is deleted.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
If empty, add * ''None currently'' below this comment. -->
*{{tfdl|Fb_cl_header|2018 April 19|section=Mass Fb cl templates}}
*:Would it be possible for a bot to convert the transclusions of these templates to [[Module:Sports table]]? [[User:S.A. Julio|S.A. Julio]] ([[User talk:S.A. Julio#top|talk]]) 23:50, 28 April 2018 (UTC)
*::Should be doable, yes. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 00:22, 29 April 2018 (UTC)
*:::I could probably do something while I am converting all the {{tld|Fb team}} templates.  But, I will have to see how complicated the code is.  Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 00:36, 29 April 2018 (UTC)
*::::{{ping|Plastikspork|Primefac}} Can your bots using [[Module:Sports table]] instead in this case, such as [https://en.wikipedia.org/w/index.php?title=User:Twwalter/2011_MLS_table_concept&diff=prev&oldid=838700657]? [[User:Hhhhhkohhhhh|Hhhhhkohhhhh]] ([[User talk:Hhhhhkohhhhh|talk]]) 04:14, 29 April 2018 (UTC)
*:::::[[User:Hhhhhkohhhhh|Hhhhhkohhhhh]], sure.  That particular template only had one use, and that use was in userspace, and the title of the page was "concept", so I didn't bother to fully convert it.  But in general, the plan is to convert the various table/cl header/cl footer/cl team templates to use sports table. Thanks! [[User:Plastikspork|Plastikspork]] [[User talk:Plastikspork|<sub style="font-size: 60%">―Œ</sub><sup style="margin-left:-3ex">(talk)</sup>]] 12:41, 29 April 2018 (UTC)
*:::::: I am replacing all of these fb templates [[User:Frietjes|Frietjes]] ([[User talk:Frietjes|talk]]) 15:08, 20 February 2019 (UTC)
*Merge into {{t|Aircraft specs}}:
**{{tfdl|Aerospecs|2019 March 20|section=Template:Aerospecs}}
**{{tfdl|Aircraft_specifications|2019 March 20|section=Template:Aerospecs}}
*::There's a discussion about this merger at [[Wikipedia talk:WikiProject Aircraft/Archive_45#Template:Aircraft specs merger bot]] --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 15:52, 8 August 2019 (UTC)
*{{tfdl|Ship_event_row|2020 May 27|section=Ship event row}} and {{tfdl|Ship_builder|2020 May 27|section=Ship event row}}
** These were listed for substing, but look what happens when you do that: [[Special:Diff/960980656]]! Something else should probably be done. --[[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 00:13, 6 June 2020 (UTC)
***Simple subst doesn't really cut it when dealing with parser functions like #if. I've not been working on TFD-related stuff recently but with other projects starting to get finished I'll take a look provided no one else tackles it first. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 21:19, 6 June 2020 (UTC)
****This one is probably best done manually. There's not that many articles affected and I'll work on it over the next couple of weeks. If any other editor wishes to join in feel free. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:35, 9 June 2020 (UTC)
*****{{u|Mdaniels5757}} and {{u|Primefac}} the templates were listed for deprecation, removal and deletion. Shipbuilder is not that big a problem and per my comments at the original nom, it might be kept as it is in use outside of the lists I mention at the original nom. Ship event row is the problem template. [[User:Mjroots|Mjroots]] ([[User talk:Mjroots|talk]]) 08:40, 9 June 2020 (UTC)
*{{tfdl|Foo|2020 March 18|section=Foo|ns=Module}}

===To merge===
{{anchor|m}}
Templates to be merged into another template.

<!-- list begin (leave this here); please link to the per-day page that has the discussion on it.
Use the format:
* {{tfdl|template name|log date (YYYY Month DD)}}
 or
* log date (YYYY Month DD) – explanation
  -->
====Arts====
* ''None currently''

====Geography, politics and governance====
*{{tfdl|COVID-19_pandemic_curfews|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}
*{{tfdl|COVID-19_pandemic_lockdowns|2020 May 16|section=Template:2020 coronavirus pandemic curfews}}

====Religion====
* ''None currently''

====Sports====
*{{tfdl|Football_squad_player2|2020 February 1|section=Template:Football squad player2}}
:{{tfdl|Football_squad_player|2020 February 1|section=Template:Football squad player2}}
:* '''Note''' Pending [[Template_talk:Football_squad_player#Redesign_RfC|Redesign RfC]] [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 18:51, 11 April 2020 (UTC)
::* I've closed the RfC. [[User:Mdaniels5757|Mdaniels5757]] ([[User talk:Mdaniels5757|talk]]) 15:15, 3 May 2020 (UTC)

====Transport====
*{{tfdl|Infobox_German_railway_vehicle|2020 March 18|section=Template:Infobox German railway vehicle}}
*{{tfdl|Infobox_locomotive|2020 March 18|section=Template:Infobox German railway vehicle}}

====Other====
*{{tfdl|Infobox_war_faction|2020 March 19|section=Template:Infobox war faction}}
*{{tfdl|Infobox_militant_organization|2020 March 19|section=Template:Infobox war faction}}
** In progress [[User:Robertsky|robertsky]] ([[User talk:Robertsky|talk]]) 17:12, 2 May 2020 (UTC)

====Meta====
* Merge with [[Template:Infobox Chinese]]
** {{tfdl|Infobox name module|2017 April 7|section=Template:Infobox name module}}
** {{tfdl|Infobox East Asian name|2017 May 26}}
* {{tfdl|Vandal-m|2019 March 7|section=Module:Vandal-m|ns=Module}}
*: Merged module written in sandbox (although much of the coded I added to [[Module:UserLinks]] should probably be in [[Module:UserLinks/extra]] instead. [[User:Pppery|&#123;&#123;3x&#124;p&#125;&#125;ery]] ([[User talk:Pppery|talk]])  15:13, 16 March 2019 (UTC)
*::I've set up some {{oldid2|908855084|testcases}} and it outputs the same thing as the old one except for the autoblock thing which I assume was intentionl since it doesn't work. I think it could be completed now. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 13:37, 1 August 2019 (UTC)
*::: Yes, removal of the broken autoblock link was intentional. [[User:Pppery|* Pppery *]] [[User talk:Pppery|<sub style="color:#800000">it has begun...</sub>]] 14:04, 1 August 2019 (UTC)
* Merge into {{t|Copied}}
** {{tfdl|Copied multi|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Merged-from|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Copied|2019 August 10|section=Template:Copied multi}}
** {{tfdl|Copied multi/Afd-merged-from|2019 August 10|section=Template:Copied multi}}
***Could I claim this merger? I would like to convert this into my first module. It may take some time though since I have zero lua experience. --[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 18:53, 4 September 2019 (UTC)
****Go for it. Just makes sure you sandbox heavily and maybe have one of us check it before you go live. [[User:Primefac|Primefac]] ([[User talk:Primefac|talk]]) 19:09, 4 September 2019 (UTC)
***5 months later and I have actually gotten to doing it. Feedback appreciated at [[Template_talk:Copied#Major update and lua conversion]]. ‑‑[[User:Trialpears|Trialpears]] ([[User talk:Trialpears|talk]]) 19:08, 6 February 2020 (UTC)
*{{tfdl|Basic_example|2020 February 13|section=Module:HelloWorld|ns=Module}} merge with [[Module:Example]]
*{{tfdl|R_to_anchor_2|2020 February 5|section=Template:R to anchor 2}}
*{{tfdl|R_to_anchor|2020 February 5|section=Template:R to anchor 2}}
** What does the "merge" result mean here? SMcCandlish gave two options, either to remove the line that handles the printworthyness or replace it with a parameter. --[[User:Gonnym|Gonnym]] ([[User talk:Gonnym|talk]]) 09:35, 22 April 2020 (UTC)
*{{tfdl|Shortcut/policy|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut/further|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Shortcut|2020 May 16|section=Module:Shortcut/policy|ns=Module}}
*{{tfdl|Timed_block|2020 June 2|section=Template:Timed block}}
*{{tfdl|Uw-block|2020 June 2|section=Template:Timed block}}

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
*''None currently''

===Ready for deletion===
{{anchor|d}}
Templates for which consensus to delete has been reached, and for which orphaning has been completed, can be listed here for an administrator to delete. Remove from this list when an item has been deleted. See also {{tl|Deleted template}}, an option to delete templates while retaining them for displaying old page revisions.
<!-- list begin (leave this here); use the format:
* {{tfdl|template name|log date (YYYY Month D)|delete=1}}
If empty, add * ''None currently'' below this comment. -->
* ''None currently''
`,
				summary: model.getEditSummary({prefix: "Listing module:"})
			}, transformed);
		});
	});
});