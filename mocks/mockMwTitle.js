// Replacement for mw.Title in MediaWiki core, for use in testing.
// Based on "mediawiki-title", but with closer syntax matching of mw.Title.
// Partial replacement only, mw.Title methods not replicated throw an error.

import {Namespace as _Namespace, Title as _Title} from "../node_modules/mediawiki-title";

const notReplicatedError = methodName => new Error(`mw.Title method ${methodName} not replicated`);

const NS_MAIN = 0;

/**
 * Site info from https://en.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general%7Cnamespaces%7Cnamespacealiases%7Cspecialpagealiases
 * See https://github.com/wikimedia/mediawiki-title#SiteInfo 
 */
const siteInfo = {
	"general": {
		"legaltitlechars": " %!\"$&'()*,\\-.\\/0-9:;=?@A-Z\\\\^_`a-z~\\x80-\\xFF+",
		"case": "first-letter",
		"lang": "en"
	},
	"namespaces": {
		"-2": {
			"id": -2,
			"case": "first-letter",
			"canonical": "Media",
			"*": "Media"
		},
		"-1": {
			"id": -1,
			"case": "first-letter",
			"canonical": "Special",
			"*": "Special"
		},
		"0": {
			"id": 0,
			"case": "first-letter",
			"content": "",
			"*": ""
		},
		"1": {
			"id": 1,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Talk",
			"*": "Talk"
		},
		"2": {
			"id": 2,
			"case": "first-letter",
			"subpages": "",
			"canonical": "User",
			"*": "User"
		},
		"3": {
			"id": 3,
			"case": "first-letter",
			"subpages": "",
			"canonical": "User talk",
			"*": "User talk"
		},
		"4": {
			"id": 4,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Project",
			"*": "Wikipedia"
		},
		"5": {
			"id": 5,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Project talk",
			"*": "Wikipedia talk"
		},
		"6": {
			"id": 6,
			"case": "first-letter",
			"canonical": "File",
			"*": "File"
		},
		"7": {
			"id": 7,
			"case": "first-letter",
			"subpages": "",
			"canonical": "File talk",
			"*": "File talk"
		},
		"8": {
			"id": 8,
			"case": "first-letter",
			"canonical": "MediaWiki",
			"namespaceprotection": "editinterface",
			"*": "MediaWiki"
		},
		"9": {
			"id": 9,
			"case": "first-letter",
			"subpages": "",
			"canonical": "MediaWiki talk",
			"*": "MediaWiki talk"
		},
		"10": {
			"id": 10,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Template",
			"*": "Template"
		},
		"11": {
			"id": 11,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Template talk",
			"*": "Template talk"
		},
		"12": {
			"id": 12,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Help",
			"*": "Help"
		},
		"13": {
			"id": 13,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Help talk",
			"*": "Help talk"
		},
		"14": {
			"id": 14,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Category",
			"*": "Category"
		},
		"15": {
			"id": 15,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Category talk",
			"*": "Category talk"
		},
		"100": {
			"id": 100,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Portal",
			"*": "Portal"
		},
		"101": {
			"id": 101,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Portal talk",
			"*": "Portal talk"
		},
		"108": {
			"id": 108,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Book",
			"*": "Book"
		},
		"109": {
			"id": 109,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Book talk",
			"*": "Book talk"
		},
		"118": {
			"id": 118,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Draft",
			"*": "Draft"
		},
		"119": {
			"id": 119,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Draft talk",
			"*": "Draft talk"
		},
		"446": {
			"id": 446,
			"case": "first-letter",
			"canonical": "Education Program",
			"*": "Education Program"
		},
		"447": {
			"id": 447,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Education Program talk",
			"*": "Education Program talk"
		},
		"710": {
			"id": 710,
			"case": "first-letter",
			"canonical": "TimedText",
			"*": "TimedText"
		},
		"711": {
			"id": 711,
			"case": "first-letter",
			"canonical": "TimedText talk",
			"*": "TimedText talk"
		},
		"828": {
			"id": 828,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Module",
			"*": "Module"
		},
		"829": {
			"id": 829,
			"case": "first-letter",
			"subpages": "",
			"canonical": "Module talk",
			"*": "Module talk"
		},
		"2300": {
			"id": 2300,
			"case": "first-letter",
			"canonical": "Gadget",
			"namespaceprotection": "gadgets-edit",
			"*": "Gadget"
		},
		"2301": {
			"id": 2301,
			"case": "first-letter",
			"canonical": "Gadget talk",
			"*": "Gadget talk"
		},
		"2302": {
			"id": 2302,
			"case": "case-sensitive",
			"canonical": "Gadget definition",
			"namespaceprotection": "gadgets-definition-edit",
			"defaultcontentmodel": "GadgetDefinition",
			"*": "Gadget definition"
		},
		"2303": {
			"id": 2303,
			"case": "case-sensitive",
			"canonical": "Gadget definition talk",
			"*": "Gadget definition talk"
		}
	},
	"namespacealiases": [
		{
			"id": 4,
			"*": "WP"
		},
		{
			"id": 5,
			"*": "WT"
		},
		{
			"id": 6,
			"*": "Image"
		},
		{
			"id": 7,
			"*": "Image talk"
		}
	],
	"specialpagealiases": [
		{
			"realname": "BrokenRedirects",
			"aliases": [
				"BrokenRedirects"
			]
		},
		{
			"realname": "Deadendpages",
			"aliases": [
				"DeadendPages"
			]
		},
		{
			"realname": "DoubleRedirects",
			"aliases": [
				"DoubleRedirects"
			]
		},
		{
			"realname": "Longpages",
			"aliases": [
				"LongPages"
			]
		},
		{
			"realname": "Ancientpages",
			"aliases": [
				"AncientPages"
			]
		},
		{
			"realname": "Lonelypages",
			"aliases": [
				"LonelyPages",
				"OrphanedPages"
			]
		},
		{
			"realname": "Fewestrevisions",
			"aliases": [
				"FewestRevisions"
			]
		},
		{
			"realname": "Withoutinterwiki",
			"aliases": [
				"WithoutInterwiki"
			]
		},
		{
			"realname": "Protectedpages",
			"aliases": [
				"ProtectedPages"
			]
		},
		{
			"realname": "Protectedtitles",
			"aliases": [
				"ProtectedTitles"
			]
		},
		{
			"realname": "Shortpages",
			"aliases": [
				"ShortPages"
			]
		},
		{
			"realname": "Uncategorizedcategories",
			"aliases": [
				"UncategorizedCategories"
			]
		},
		{
			"realname": "Uncategorizedimages",
			"aliases": [
				"UncategorizedFiles",
				"UncategorizedImages"
			]
		},
		{
			"realname": "Uncategorizedpages",
			"aliases": [
				"UncategorizedPages"
			]
		},
		{
			"realname": "Uncategorizedtemplates",
			"aliases": [
				"UncategorizedTemplates"
			]
		},
		{
			"realname": "Unusedcategories",
			"aliases": [
				"UnusedCategories"
			]
		},
		{
			"realname": "Unusedimages",
			"aliases": [
				"UnusedFiles",
				"UnusedImages"
			]
		},
		{
			"realname": "Unusedtemplates",
			"aliases": [
				"UnusedTemplates"
			]
		},
		{
			"realname": "Unwatchedpages",
			"aliases": [
				"UnwatchedPages"
			]
		},
		{
			"realname": "Wantedcategories",
			"aliases": [
				"WantedCategories"
			]
		},
		{
			"realname": "Wantedfiles",
			"aliases": [
				"WantedFiles"
			]
		},
		{
			"realname": "Wantedpages",
			"aliases": [
				"WantedPages",
				"BrokenLinks"
			]
		},
		{
			"realname": "Wantedtemplates",
			"aliases": [
				"WantedTemplates"
			]
		},
		{
			"realname": "Allpages",
			"aliases": [
				"AllPages"
			]
		},
		{
			"realname": "Prefixindex",
			"aliases": [
				"PrefixIndex"
			]
		},
		{
			"realname": "Categories",
			"aliases": [
				"Categories"
			]
		},
		{
			"realname": "Listredirects",
			"aliases": [
				"ListRedirects"
			]
		},
		{
			"realname": "PagesWithProp",
			"aliases": [
				"PagesWithProp",
				"Pageswithprop",
				"PagesByProp",
				"Pagesbyprop"
			]
		},
		{
			"realname": "TrackingCategories",
			"aliases": [
				"TrackingCategories"
			]
		},
		{
			"realname": "Userlogin",
			"aliases": [
				"UserLogin",
				"Login"
			]
		},
		{
			"realname": "Userlogout",
			"aliases": [
				"UserLogout",
				"Logout"
			]
		},
		{
			"realname": "CreateAccount",
			"aliases": [
				"CreateAccount"
			]
		},
		{
			"realname": "LinkAccounts",
			"aliases": [
				"LinkAccounts"
			]
		},
		{
			"realname": "UnlinkAccounts",
			"aliases": [
				"UnlinkAccounts"
			]
		},
		{
			"realname": "ChangeCredentials",
			"aliases": [
				"ChangeCredentials"
			]
		},
		{
			"realname": "RemoveCredentials",
			"aliases": [
				"RemoveCredentials"
			]
		},
		{
			"realname": "Activeusers",
			"aliases": [
				"ActiveUsers"
			]
		},
		{
			"realname": "Block",
			"aliases": [
				"Block",
				"BlockIP",
				"BlockUser"
			]
		},
		{
			"realname": "Unblock",
			"aliases": [
				"Unblock"
			]
		},
		{
			"realname": "BlockList",
			"aliases": [
				"BlockList",
				"ListBlocks",
				"IPBlockList"
			]
		},
		{
			"realname": "AutoblockList",
			"aliases": [
				"AutoblockList",
				"ListAutoblocks"
			]
		},
		{
			"realname": "ChangePassword",
			"aliases": [
				"ChangePassword",
				"ResetPass",
				"ResetPassword"
			]
		},
		{
			"realname": "BotPasswords",
			"aliases": [
				"BotPasswords"
			]
		},
		{
			"realname": "PasswordReset",
			"aliases": [
				"PasswordReset"
			]
		},
		{
			"realname": "DeletedContributions",
			"aliases": [
				"DeletedContributions"
			]
		},
		{
			"realname": "Preferences",
			"aliases": [
				"Preferences"
			]
		},
		{
			"realname": "ResetTokens",
			"aliases": [
				"ResetTokens"
			]
		},
		{
			"realname": "Contributions",
			"aliases": [
				"Contributions",
				"Contribs"
			]
		},
		{
			"realname": "Listgrouprights",
			"aliases": [
				"ListGroupRights",
				"UserGroupRights"
			]
		},
		{
			"realname": "Listgrants",
			"aliases": [
				"ListGrants"
			]
		},
		{
			"realname": "Listusers",
			"aliases": [
				"ListUsers",
				"UserList",
				"Users"
			]
		},
		{
			"realname": "Listadmins",
			"aliases": [
				"ListAdmins"
			]
		},
		{
			"realname": "Listbots",
			"aliases": [
				"ListBots"
			]
		},
		{
			"realname": "Userrights",
			"aliases": [
				"UserRights",
				"MakeSysop",
				"MakeBot"
			]
		},
		{
			"realname": "EditWatchlist",
			"aliases": [
				"EditWatchlist"
			]
		},
		{
			"realname": "PasswordPolicies",
			"aliases": [
				"PasswordPolicies"
			]
		},
		{
			"realname": "Newimages",
			"aliases": [
				"NewFiles",
				"NewImages"
			]
		},
		{
			"realname": "Log",
			"aliases": [
				"Log",
				"Logs"
			]
		},
		{
			"realname": "Watchlist",
			"aliases": [
				"Watchlist"
			]
		},
		{
			"realname": "Newpages",
			"aliases": [
				"NewPages"
			]
		},
		{
			"realname": "Recentchanges",
			"aliases": [
				"RecentChanges"
			]
		},
		{
			"realname": "Recentchangeslinked",
			"aliases": [
				"RecentChangesLinked",
				"RelatedChanges"
			]
		},
		{
			"realname": "Tags",
			"aliases": [
				"Tags"
			]
		},
		{
			"realname": "Listfiles",
			"aliases": [
				"ListFiles",
				"FileList",
				"ImageList"
			]
		},
		{
			"realname": "Filepath",
			"aliases": [
				"FilePath"
			]
		},
		{
			"realname": "MediaStatistics",
			"aliases": [
				"MediaStatistics"
			]
		},
		{
			"realname": "MIMEsearch",
			"aliases": [
				"MIMESearch"
			]
		},
		{
			"realname": "FileDuplicateSearch",
			"aliases": [
				"FileDuplicateSearch"
			]
		},
		{
			"realname": "Upload",
			"aliases": [
				"Upload"
			]
		},
		{
			"realname": "UploadStash",
			"aliases": [
				"UploadStash"
			]
		},
		{
			"realname": "ListDuplicatedFiles",
			"aliases": [
				"ListDuplicatedFiles",
				"ListFileDuplicates"
			]
		},
		{
			"realname": "ApiSandbox",
			"aliases": [
				"ApiSandbox"
			]
		},
		{
			"realname": "Statistics",
			"aliases": [
				"Statistics",
				"Stats"
			]
		},
		{
			"realname": "Allmessages",
			"aliases": [
				"AllMessages"
			]
		},
		{
			"realname": "Version",
			"aliases": [
				"Version"
			]
		},
		{
			"realname": "Lockdb",
			"aliases": [
				"LockDB"
			]
		},
		{
			"realname": "Unlockdb",
			"aliases": [
				"UnlockDB"
			]
		},
		{
			"realname": "LinkSearch",
			"aliases": [
				"LinkSearch"
			]
		},
		{
			"realname": "Randompage",
			"aliases": [
				"Random",
				"RandomPage"
			]
		},
		{
			"realname": "RandomInCategory",
			"aliases": [
				"RandomInCategory"
			]
		},
		{
			"realname": "Randomredirect",
			"aliases": [
				"RandomRedirect"
			]
		},
		{
			"realname": "Randomrootpage",
			"aliases": [
				"RandomRootpage"
			]
		},
		{
			"realname": "GoToInterwiki",
			"aliases": [
				"GoToInterwiki"
			]
		},
		{
			"realname": "Mostlinkedcategories",
			"aliases": [
				"MostLinkedCategories",
				"MostUsedCategories"
			]
		},
		{
			"realname": "Mostimages",
			"aliases": [
				"MostLinkedFiles",
				"MostFiles",
				"MostImages"
			]
		},
		{
			"realname": "Mostinterwikis",
			"aliases": [
				"MostInterwikis"
			]
		},
		{
			"realname": "Mostlinked",
			"aliases": [
				"MostLinkedPages",
				"MostLinked"
			]
		},
		{
			"realname": "Mostlinkedtemplates",
			"aliases": [
				"MostTranscludedPages",
				"MostLinkedTemplates",
				"MostUsedTemplates"
			]
		},
		{
			"realname": "Mostcategories",
			"aliases": [
				"MostCategories"
			]
		},
		{
			"realname": "Mostrevisions",
			"aliases": [
				"MostRevisions"
			]
		},
		{
			"realname": "ComparePages",
			"aliases": [
				"ComparePages"
			]
		},
		{
			"realname": "Export",
			"aliases": [
				"Export"
			]
		},
		{
			"realname": "Import",
			"aliases": [
				"Import"
			]
		},
		{
			"realname": "Undelete",
			"aliases": [
				"Undelete"
			]
		},
		{
			"realname": "Whatlinkshere",
			"aliases": [
				"WhatLinksHere"
			]
		},
		{
			"realname": "MergeHistory",
			"aliases": [
				"MergeHistory"
			]
		},
		{
			"realname": "ExpandTemplates",
			"aliases": [
				"ExpandTemplates"
			]
		},
		{
			"realname": "ChangeContentModel",
			"aliases": [
				"ChangeContentModel"
			]
		},
		{
			"realname": "Booksources",
			"aliases": [
				"BookSources"
			]
		},
		{
			"realname": "ApiHelp",
			"aliases": [
				"ApiHelp"
			]
		},
		{
			"realname": "Blankpage",
			"aliases": [
				"BlankPage"
			]
		},
		{
			"realname": "Diff",
			"aliases": [
				"Diff"
			]
		},
		{
			"realname": "EditPage",
			"aliases": [
				"EditPage",
				"Edit"
			]
		},
		{
			"realname": "EditTags",
			"aliases": [
				"EditTags"
			]
		},
		{
			"realname": "Emailuser",
			"aliases": [
				"EmailUser",
				"Email"
			]
		},
		{
			"realname": "Movepage",
			"aliases": [
				"MovePage"
			]
		},
		{
			"realname": "Mycontributions",
			"aliases": [
				"MyContributions"
			]
		},
		{
			"realname": "MyLanguage",
			"aliases": [
				"MyLanguage"
			]
		},
		{
			"realname": "Mypage",
			"aliases": [
				"MyPage"
			]
		},
		{
			"realname": "Mytalk",
			"aliases": [
				"MyTalk"
			]
		},
		{
			"realname": "PageHistory",
			"aliases": [
				"PageHistory",
				"History"
			]
		},
		{
			"realname": "PageInfo",
			"aliases": [
				"PageInfo",
				"Info"
			]
		},
		{
			"realname": "Purge",
			"aliases": [
				"Purge"
			]
		},
		{
			"realname": "Myuploads",
			"aliases": [
				"MyUploads",
				"MyFiles"
			]
		},
		{
			"realname": "AllMyUploads",
			"aliases": [
				"AllMyUploads",
				"AllMyFiles"
			]
		},
		{
			"realname": "NewSection",
			"aliases": [
				"NewSection",
				"Newsection"
			]
		},
		{
			"realname": "PermanentLink",
			"aliases": [
				"PermanentLink",
				"PermaLink"
			]
		},
		{
			"realname": "Redirect",
			"aliases": [
				"Redirect"
			]
		},
		{
			"realname": "Revisiondelete",
			"aliases": [
				"RevisionDelete"
			]
		},
		{
			"realname": "RunJobs",
			"aliases": [
				"RunJobs"
			]
		},
		{
			"realname": "Specialpages",
			"aliases": [
				"SpecialPages"
			]
		},
		{
			"realname": "PageData",
			"aliases": [
				"PageData"
			]
		},
		{
			"realname": "Search",
			"aliases": [
				"Search"
			]
		},
		{
			"realname": "Confirmemail",
			"aliases": [
				"ConfirmEmail"
			]
		},
		{
			"realname": "Invalidateemail",
			"aliases": [
				"InvalidateEmail"
			]
		},
		{
			"realname": "ChangeEmail",
			"aliases": [
				"ChangeEmail"
			]
		},
		{
			"realname": "Mute",
			"aliases": [
				"Mute"
			]
		},
		{
			"realname": "Hieroglyphs",
			"aliases": [
				"Hieroglyphs"
			]
		},
		{
			"realname": "SiteMatrix",
			"aliases": [
				"SiteMatrix",
				"WikimediaWikis"
			]
		},
		{
			"realname": "CiteThisPage",
			"aliases": [
				"CiteThisPage",
				"Cite"
			]
		},
		{
			"realname": "CategoryTree",
			"aliases": [
				"CategoryTree"
			]
		},
		{
			"realname": "Gadgets",
			"aliases": [
				"Gadgets"
			]
		},
		{
			"realname": "GadgetUsage",
			"aliases": [
				"GadgetUsage"
			]
		},
		{
			"realname": "OrphanedTimedText",
			"aliases": [
				"OrphanedTimedText"
			]
		},
		{
			"realname": "TranscodeStatistics",
			"aliases": [
				"Transcode_statistics",
				"Transcode_Statistics",
				"TimedMediaHandler"
			]
		},
		{
			"realname": "UrlShortener",
			"aliases": [
				"UrlShortener"
			]
		},
		{
			"realname": "UrlRedirector",
			"aliases": [
				"UrlRedirector"
			]
		},
		{
			"realname": "ManageShortUrls",
			"aliases": [
				"ManageShortUrls"
			]
		},
		{
			"realname": "GlobalBlock",
			"aliases": [
				"GlobalBlock"
			]
		},
		{
			"realname": "GlobalBlockList",
			"aliases": [
				"GlobalBlockList"
			]
		},
		{
			"realname": "GlobalBlockStatus",
			"aliases": [
				"GlobalBlockWhitelist",
				"GlobalBlockStatus",
				"DisableGlobalBlock"
			]
		},
		{
			"realname": "RemoveGlobalBlock",
			"aliases": [
				"GlobalUnblock",
				"RemoveGlobalBlock"
			]
		},
		{
			"realname": "SecurePoll",
			"aliases": [
				"SecurePoll"
			]
		},
		{
			"realname": "Renameuser",
			"aliases": [
				"RenameUser"
			]
		},
		{
			"realname": "Nuke",
			"aliases": [
				"Nuke"
			]
		},
		{
			"realname": "Captcha",
			"aliases": [
				"Captcha"
			]
		},
		{
			"realname": "CentralAuth",
			"aliases": [
				"CentralAuth",
				"GlobalAccount"
			]
		},
		{
			"realname": "CentralLogin",
			"aliases": [
				"CentralLogin"
			]
		},
		{
			"realname": "CentralAutoLogin",
			"aliases": [
				"CentralAutoLogin"
			]
		},
		{
			"realname": "MergeAccount",
			"aliases": [
				"MergeAccount"
			]
		},
		{
			"realname": "GlobalGroupMembership",
			"aliases": [
				"GlobalUserRights",
				"GlobalGroupMembership"
			]
		},
		{
			"realname": "GlobalGroupPermissions",
			"aliases": [
				"GlobalGroupPermissions"
			]
		},
		{
			"realname": "WikiSets",
			"aliases": [
				"WikiSets",
				"EditWikiSets"
			]
		},
		{
			"realname": "GlobalUsers",
			"aliases": [
				"GlobalUsers"
			]
		},
		{
			"realname": "MultiLock",
			"aliases": [
				"MultiLock"
			]
		},
		{
			"realname": "GlobalRenameUser",
			"aliases": [
				"GlobalRenameUser"
			]
		},
		{
			"realname": "GlobalRenameProgress",
			"aliases": [
				"GlobalRenameProgress"
			]
		},
		{
			"realname": "GlobalUserMerge",
			"aliases": [
				"GlobalUserMerge"
			]
		},
		{
			"realname": "ApiFeatureUsage",
			"aliases": [
				"ApiFeatureUsage"
			]
		},
		{
			"realname": "BannerLoader",
			"aliases": [
				"BannerLoader"
			]
		},
		{
			"realname": "BannerRandom",
			"aliases": [
				"BannerRandom"
			]
		},
		{
			"realname": "RecordImpression",
			"aliases": [
				"RecordImpression"
			]
		},
		{
			"realname": "HideBanners",
			"aliases": [
				"HideBanners"
			]
		},
		{
			"realname": "CNReporter",
			"aliases": [
				"CNReporter"
			]
		},
		{
			"realname": "Book",
			"aliases": [
				"Book",
				"Collection"
			]
		},
		{
			"realname": "RenderBook",
			"aliases": [
				"RenderBook"
			]
		},
		{
			"realname": "ElectronPdf",
			"aliases": [
				"ElectronPdf"
			]
		},
		{
			"realname": "AbuseLog",
			"aliases": [
				"AbuseLog"
			]
		},
		{
			"realname": "AbuseFilter",
			"aliases": [
				"AbuseFilter"
			]
		},
		{
			"realname": "MostGloballyLinkedFiles",
			"aliases": [
				"MostGloballyLinkedFiles"
			]
		},
		{
			"realname": "GloballyWantedFiles",
			"aliases": [
				"GloballyWantedFiles"
			]
		},
		{
			"realname": "GloballyUnusedFiles",
			"aliases": [
				"GloballyUnusedFiles"
			]
		},
		{
			"realname": "GlobalUsage",
			"aliases": [
				"GlobalUsage"
			]
		},
		{
			"realname": "MassMessage",
			"aliases": [
				"MassMessage"
			]
		},
		{
			"realname": "CreateMassMessageList",
			"aliases": [
				"CreateMassMessageList"
			]
		},
		{
			"realname": "EditMassMessageList",
			"aliases": [
				"EditMassMessageList"
			]
		},
		{
			"realname": "BetaFeatures",
			"aliases": [
				"BetaFeatures"
			]
		},
		{
			"realname": "LintErrors",
			"aliases": [
				"LintErrors"
			]
		},
		{
			"realname": "CollabPad",
			"aliases": [
				"CollabPad",
				"Collab_Pad"
			]
		},
		{
			"realname": "History",
			"aliases": [
				"History"
			]
		},
		{
			"realname": "MobileCite",
			"aliases": [
				"MobileCite"
			]
		},
		{
			"realname": "MobileDiff",
			"aliases": [
				"MobileDiff"
			]
		},
		{
			"realname": "MobileOptions",
			"aliases": [
				"MobileOptions"
			]
		},
		{
			"realname": "MobileMenu",
			"aliases": [
				"MobileMenu"
			]
		},
		{
			"realname": "MobileLanguages",
			"aliases": [
				"MobileLanguages"
			]
		},
		{
			"realname": "Uploads",
			"aliases": [
				"Uploads"
			]
		},
		{
			"realname": "MathShowImage",
			"aliases": [
				"MathShowImage"
			]
		},
		{
			"realname": "MathStatus",
			"aliases": [
				"MathStatus"
			]
		},
		{
			"realname": "MathWikibase",
			"aliases": [
				"MathWikibase"
			]
		},
		{
			"realname": "VipsTest",
			"aliases": [
				"VipsTest"
			]
		},
		{
			"realname": "FeedItem",
			"aliases": [
				"FeedItem"
			]
		},
		{
			"realname": "NewPagesFeed",
			"aliases": [
				"NewPagesFeed"
			]
		},
		{
			"realname": "Interwiki",
			"aliases": [
				"Interwiki"
			]
		},
		{
			"realname": "Notifications",
			"aliases": [
				"Notifications"
			]
		},
		{
			"realname": "DisplayNotificationsConfiguration",
			"aliases": [
				"DisplayNotificationsConfiguration"
			]
		},
		{
			"realname": "NotificationsMarkRead",
			"aliases": [
				"NotificationsMarkRead"
			]
		},
		{
			"realname": "Thanks",
			"aliases": [
				"Thanks"
			]
		},
		{
			"realname": "DisambiguationPages",
			"aliases": [
				"DisambiguationPages"
			]
		},
		{
			"realname": "DisambiguationPageLinks",
			"aliases": [
				"DisambiguationPageLinks"
			]
		},
		{
			"realname": "SimulateTwoColEditConflict",
			"aliases": [
				"SimulateTwoColEditConflict"
			]
		},
		{
			"realname": "UserMerge",
			"aliases": [
				"UserMerge"
			]
		},
		{
			"realname": "ContentTranslation",
			"aliases": [
				"ContentTranslation",
				"CX"
			]
		},
		{
			"realname": "ContentTranslationStats",
			"aliases": [
				"ContentTranslationStats",
				"CXStats"
			]
		},
		{
			"realname": "ExternalGuidance",
			"aliases": [
				"ExternalGuidance"
			]
		},
		{
			"realname": "TemplateSandbox",
			"aliases": [
				"TemplateSandbox"
			]
		},
		{
			"realname": "PageAssessments",
			"aliases": [
				"PageAssessments"
			]
		},
		{
			"realname": "GraphSandbox",
			"aliases": [
				"GraphSandbox"
			]
		},
		{
			"realname": "OAuth",
			"aliases": [
				"OAuth",
				"MWOAuth"
			]
		},
		{
			"realname": "OAuthManageMyGrants",
			"aliases": [
				"OAuthManageMyGrants",
				"OAuthGrants"
			]
		},
		{
			"realname": "OAuthListConsumers",
			"aliases": [
				"OAuthListConsumers"
			]
		},
		{
			"realname": "DisableOATHForUser",
			"aliases": [
				"DisableOATHForUser"
			]
		},
		{
			"realname": "VerifyOATHForUser",
			"aliases": [
				"VerifyOATHForUser"
			]
		},
		{
			"realname": "OATHManage",
			"aliases": [
				"Manage_Two-factor_authentication",
				"OATH_Manage",
				"OATHManage",
				"OATH",
				"Two-factor_authentication",
				"OATHAuth"
			]
		},
		{
			"realname": "ORESModels",
			"aliases": [
				"ORESModels"
			]
		},
		{
			"realname": "CheckUser",
			"aliases": [
				"CheckUser"
			]
		},
		{
			"realname": "CheckUserLog",
			"aliases": [
				"CheckUserLog"
			]
		},
		{
			"realname": "Map",
			"aliases": [
				"Map"
			]
		},
		{
			"realname": "GlobalPreferences",
			"aliases": [
				"GlobalPreferences"
			]
		},
		{
			"realname": "UnconnectedPages",
			"aliases": [
				"UnconnectedPages",
				"WithoutConnection",
				"WithoutSitelinks"
			]
		},
		{
			"realname": "PagesWithBadges",
			"aliases": [
				"PagesWithBadges",
				"QueryBadges"
			]
		},
		{
			"realname": "EntityUsage",
			"aliases": [
				"EntityUsage",
				"EntityUsageData"
			]
		},
		{
			"realname": "GlobalRenameRequest",
			"aliases": [
				"GlobalRenameRequest"
			]
		},
		{
			"realname": "GlobalRenameQueue",
			"aliases": [
				"GlobalRenameQueue"
			]
		},
		{
			"realname": "RevisionReview",
			"aliases": [
				"RevisionReview"
			]
		},
		{
			"realname": "ReviewedVersions",
			"aliases": [
				"ReviewedVersions",
				"StableVersions"
			]
		},
		{
			"realname": "PendingChanges",
			"aliases": [
				"PendingChanges",
				"OldReviewedPages"
			]
		},
		{
			"realname": "ProblemChanges",
			"aliases": [
				"ProblemChanges"
			]
		},
		{
			"realname": "QualityOversight",
			"aliases": [
				"AdvancedReviewLog",
				"QualityOversight"
			]
		},
		{
			"realname": "ValidationStatistics",
			"aliases": [
				"ValidationStatistics"
			]
		},
		{
			"realname": "StablePages",
			"aliases": [
				"StablePages"
			]
		},
		{
			"realname": "Nearby",
			"aliases": [
				"Nearby"
			]
		}
	]
};

/**
 * Constructor. Either specify title, or title and namespace, or _title
 * @param {String} [title] 
 * @param {Number} [namespace] 
 * @param {_Title} [_title]
 */
function Title(title, namespace, _title) {
	if (_title) {
		this._title = _title;
	} else {
		this._title = _Title.newFromText(title, siteInfo, namespace);
	}
}
/**
 * 
 * @param {string} title 
 * @param {number} [namespace]
 */
Title.newFromText = function(title, namespace) {
	try {
		const _t = _Title.newFromText(title, siteInfo, namespace);
		return new Title(null, null, _t);
	} catch(e) {
		return null;
	}
};
/**
 * 
 * @param {number} namespace 
 * @param {string} title 
 */
Title.makeTitle = function(namespace, title) {
	const namespacePrefix = namespace === 0
		? ""
		: new _Namespace(namespace, siteInfo).getNormalizedText() + ":";
	return Title.newFromText(namespacePrefix + title);
};
Title.newFromUserInput = function() {
	throw notReplicatedError("newFromUserInput");
};
Title.newFromFileName = function() {
	throw notReplicatedError("newFromFileName");
};
Title.newFromImg = function() {
	throw notReplicatedError("newFromImg");
};
/**
 * 
 * @param {number} namespaceId 
 */
Title.isTalkNamespace = function(namespaceId) {
	return !!(namespaceId > NS_MAIN && namespaceId % 2);
};
Title.wantSignaturesNamespace = function() {
	throw notReplicatedError("wantSignaturesNamespace");
};
/**
 * 
 * @param {string|Title} title 
 */
Title.exists = function(title) {
	var match, obj = Title.exist.pages;
	if (typeof title === "string") {
		match = obj[title];
	} else if (title instanceof Title) {
		match = obj[title.toString()];
	} else {
		throw new Error("Title.exists: title must be a string or an instance of Title");
	}
	if (typeof match !== "boolean") {
		return null;
	}
	return match;
}
;
Title.exist = {
	pages: {},
	set: function(titles, state) {
		var i, len, pages = this.pages;
		titles = Array.isArray(titles) ? titles : [titles];
		state = state === undefined ? true : !!state;
		for (i = 0,
		len = titles.length; i < len; i++) {
			pages[titles[i]] = state;
		}
		return true;
	}
};
Title.normalizeExtension = function() {
	throw notReplicatedError("Title.normalizeExtension");
};
Title.phpCharToUpper = function() {
	throw notReplicatedError("Title.phpCharToUpper");
};
Title.prototype = {
	constructor: Title,
	getNamespaceId: function() {
		return this._title.getNamespace().getId();
	},
	getNamespacePrefix: function() {
		return this.getNamespaceId() === 0
			? ""
			: this._title.getNamespace().getNormalizedText();
	},
	getName: function() {
		var ext = this.getExtension();
		if (ext === null) {
			return this.getMain();
		}
		return this.getMain().slice(0, -ext.length - 1);
	},
	getNameText: function() {
		throw notReplicatedError("phpCharToUpper");
	},
	getExtension: function() {
		var lastDot = this.title.lastIndexOf(".");
		if (lastDot === -1) {
			return null;
		}
		return this.title.slice(lastDot + 1) || null;
	},
	getDotExtension: function() {
		var ext = this.getExtension();
		return ext === null ? "" : "." + ext;
	},
	getMain: function() {
		return this._title.getKey();
	},
	getMainText: function() {
		let text = this._title.getPrefixedText();
		if (this.getNamespaceId() === NS_MAIN) {
			return text;
		}
		return text.replace(/^.*?:/, "");
	},
	getPrefixedDb: function() {
		return this.getNamespacePrefix() + this.getMain();
	},
	getPrefixedText: function() {
		return this._title.getPrefixedText();
	},
	getRelativeText: function(namespace) {
		if (this.getNamespaceId() === namespace) {
			return this.getMainText();
		} else if (this.getNamespaceId() === NS_MAIN) {
			return ":" + this.getPrefixedText();
		} else {
			return this.getPrefixedText();
		}
	},
	getFragment: function() {
		return this._title.getFragment();
	},
	getUrl: function() {
		throw notReplicatedError("getUrl");
	},
	isTalkPage: function() {
		return Title.isTalkNamespace(this.getNamespaceId());
	},
	getTalkPage: function() {
		if (!this.canHaveTalkPage()) {
			return null;
		}
		return this.isTalkPage() ? this : Title.makeTitle(this.getNamespaceId() + 1, this.getMainText());
	},
	getSubjectPage: function() {
		return this.isTalkPage() ? Title.makeTitle(this.getNamespaceId() - 1, this.getMainText()) : this;
	},
	canHaveTalkPage: function() {
		return this.getNamespaceId() >= NS_MAIN;
	},
	exists: function() {
		return Title.exists(this);
	}
};
Title.prototype.toString = Title.prototype.getPrefixedDb;
Title.prototype.toText = Title.prototype.getPrefixedText;

export default Title;