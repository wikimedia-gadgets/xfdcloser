import {hasCorrectNamespace, multiButtonConfirm, setExistence} from "../../util";
import appConfig from "../../config";
import API from "../../api";
import ResizingMixin from "../Mixins/ResizingMixin";
import CloseDiscussionTask from "../Tasks/CloseDiscussionTask";
import AddOldXfdTask from "../Tasks/AddOldXfdTask";
import RemoveNomTemplatesTask from "../Tasks/RemoveNomTemplatesTask";
import RedirectTask from "../Tasks/RedirectTask";
import AddMergeTemplatesTask from "../Tasks/AddMergeTemplatesTask";
import DisambiguateTask from "../Tasks/DisambiguateTask";
import DeletePagesTask from "../Tasks/DeletePagesTask";
import DeleteTalkpagesTask from "../Tasks/DeleteTalkpagesTask";
import DeleteRedirectsTask from "../Tasks/DeleteRedirectsTask";
import UnlinkBacklinksTask from "../Tasks/UnlinkBacklinksTask";
import AddBeingDeletedTask from "../Tasks/AddBeingDeletedTask";
import AddToHoldingCellTask from "../Tasks/AddToHoldingCellTask";
import TagTalkWithSpeedyTask from "../Tasks/TagTalkWithSpeedyTask";
import GetRelistInfoTask from "../Tasks/GetRelistInfoTask";
import UpdateDiscussionTask from "../Tasks/UpdateDiscussionTask";
import UpdateOldLogPageTask from "../Tasks/UpdateOldLogPageTask";
import UpdateNewLogPageTask from "../Tasks/UpdateNewLogPageTask";
import UpdateNomTemplatesTask from "../Tasks/UpdateNomTemplatesTask";

// <nowiki>
/**
 * @param {Object} config
 * @param {Discussion} config.discussion
 * @param {String} config.type "close" or "relist" 
 * @param {Object} config.formData
 *  @param {String} config.formData.resultWikitext
 *  @param {String} config.formData.rationaleWikitext
 *  @param {mw.Title|undefined} config.formData.targetTitle
 *  @param {String|undefined} config.formData.targetWikiext
 *  @param {Object[]|false} config.formData.pageResults Array of {mw.Title}page, {String}resultType [{object}data] pairs/triplets
 * @param {Object[]} config.options Array of {String}result, {Object}options pairs, where options has {String}optionName, {*}optionValue pairs
 * @param {jQuery} config.$overlay element for overlays
 */
function TaskFormWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	TaskFormWidget.super.call( this, config );
	ResizingMixin.call(this, config);

	this.discussion = config.discussion;
	this.type = config.type;
	this.formData = config.formData;
	this.options = config.options;

	// TODO: Add task group widget and task widgets
	this.tasksFieldset = new OO.ui.FieldsetLayout({label: "Tasks"});
	this.$element.append(this.tasksFieldset.$element);

	// Do sanity checks
	this.doSanityChecks()
		.then(() => this.resolveRedirects())
		.then(() => this.initialiseTasks())
		.then(() => {
			// Simulate tasks being completed after 1.5 seconds
			window.setTimeout(
				() => this.setFinished(),
				1500
			);
		})
		.catch(reason => this.emit("cancelled", reason)); // TODO: Abort everything. Either close window, or return to previous page.
}
OO.inheritClass( TaskFormWidget, OO.ui.Widget );
OO.mixinClass( TaskFormWidget, ResizingMixin );


TaskFormWidget.prototype.setFinished = function() {
	this.emit("finished");
};

/**
 * @returns {Promise} promise resolved if okay to proceed, otherwise rejected 
 */
TaskFormWidget.prototype.doSanityChecks = function() {	
	const isMultimode = this.formData.pageResults && this.formData.pageResults.length > 1;
	let warnings = [];

	// Check if closing dicussion early (and it hasn't been relisted )
	if ( !this.discussion.isOld && !this.discussion.isRelisted ) {
		warnings.push("It has not yet been 7 days since the discussion was listed.");
	}
	
	// Check for mass actions when closing:
	const hasActions = this.options && this.options.filter(option => option.options.action !== "noActions").length > 0;
	const massPages = this.formData.pageResults && this.formData.pageResults.length > 3;
	if (hasActions && massPages) {
		warnings.push(`Mass actions will be peformed (${this.formData.pageResults.length} nominated pages detected).`);
	}
	
	const expectedNamespace = appConfig.venue.ns_number && appConfig.mw.namespaces[(appConfig.venue.ns_number[0]).toString()];
	// Check target page namespace:
	var targetTitles = isMultimode
		? [this.formData.targetTitle]
		: this.formData.pageResults
			.filter(pr => pr.data && pr.data.target)
			.map(pr => mw.Title.newFromText(pr.data.target));
	targetTitles.forEach(target => {
		if (target && expectedNamespace && !hasCorrectNamespace(target)) {
			warnings.push(`Target page [[${target.getPrefixedText()}]] is not in the ${expectedNamespace} namespace.`);
		}
	});
	
	//Check namespaces of nominated pages
	var wrongNamespacePages = this.formData.pageResults &&
		this.formData.pageResults.filter(pr => !hasCorrectNamespace(pr.page)).map(pr => pr.page);
	if ( wrongNamespacePages && wrongNamespacePages.length > 0 ) {
		warnings.push(
			`The following pages are not in the ${expectedNamespace} namespace:<ul>${
				wrongNamespacePages.map(page => "<li>[[" + page.getPrefixedText() + "]]</li>").join("")
			}</ul>`
		);
	}

	let confirmationPromise = warnings.length > 0
		? multiButtonConfirm({
			title: "Warning",
			message: `<p><ul>${warnings.map(warning=>"<li>"+warning+"</li>").join("")}</ul></p>`,
			actions: [
				{ label: "Cancel", flags: "safe" },
				{ label: "Continue", action: "proceed", flags: "progressive" }
			],
			size: "large"
		})
		: $.Deferred().resolve("proceed");

	return confirmationPromise.then(action => action === "proceed"
		? $.Deferred().resolve("proceed")
		: $.Deferred().reject("cancelled")
	);
};

/**
 * @returns {Promise} promise resolved if okay to proceed, otherwise rejected
 */
TaskFormWidget.prototype.resolveRedirects = function() {
	// No need to process for RfD, or if basic closure, or no after actions
	const isRfd = appConfig.venue.type === "rfd";
	const isBasicMode = this.discussion.isBasicMode();
	const isRelisting = this.type === "relist";
	const notFfdTfd = appConfig.venue.type !== "ffd" && appConfig.venue.type !== "tfd";
	const hasActions = this.options && this.options.filter(option => option.options.action !== "noActions").length > 0;

	if ( isRfd || isBasicMode || (isRelisting && notFfdTfd) || !hasActions ) {
		// No need to resolve any redirects
		return $.Deferred().resolve(true).promise();
	}
	
	return API.get( {
		action: "query",
		titles: this.discussion.getPageTitles(),
		redirects: 1,
		prop: "info",
		inprop: "talkid",
		formatversion: "2"
	} )
		.then( response => {
			if ( response.query && response.query.redirects ) {
				const redirections = response.query.redirects.map(redirect => "<li>[[" + redirect.from + "]] → [[" + redirect.to + "]]</li>");
				return multiButtonConfirm({
					title: "Apply actions to redirects or their targets?",
					message: `The following nominated pages are redirects to other pages:<ul>${redirections.join("")}</ul>`,
					actions: [
						{ label: "Cancel", flags: "safe" },
						{ label: "Use redirects", action: "reject" },
						{ label: "Use targets", action: "accept", flags: "progressive" }
					],
					size: "medium"
				})
					.then(function(action) {
						if ( action === "accept" ) {
							// Update results pages to use targets (for the ones that are redirects)
							this.formData.pageResults = this.formData.pageResults.map(pr => {
								const page = pr.page;
								var redirection = response.query.redirects.find(redirect => redirect.from === page.getPrefixedText());
								if ( !redirection ) {
									return page;
								}
								var target = response.query.pages.find(p => p.title === redirection.to);
								var targetTitle = mw.Title.newFromText(target.title);
								setExistence(targetTitle, target.pageid > 0);
								setExistence(targetTitle.getTalkPage(), target.talkid > 0);
								pr.page = targetTitle;
								return pr;
							});
							return true;
						} else if ( action === "reject" ) {
							// No need to update discussion's page data
							return true;
						} else {
							// Abort closing, reset discussion links
							return $.Deferred().reject("Cancelled by user");
						}
					});
			} else {
			// No redirects present, just get on with it
				return true;
			}
		});
};

TaskFormWidget.prototype.initialiseTasks = function() {
	const baseConfig = {
		appConfig: appConfig,
		discussion: this.discussion,
		api: API,
		result: this.formData.resultWikitext
	};
	const pageResultsWithOptions = this.formData.pageResults.map(pageResult => {
		const optionsForResult = this.options.find(options => options.result === pageResult.resultType);
		pageResult.options = optionsForResult.options;
		return pageResult;
	});
	let tasks = [];

	if (this.type === "close") {
		tasks = this.prepareCloseTasks(baseConfig, pageResultsWithOptions);
	} else if (this.type === "relist") {
		tasks = this.prepareRelistTasks(baseConfig);
	}
	tasks.forEach( task => task.connect(this, {"resize": "emitResize"}) );
	this.tasksFieldset.addItems( tasks );
	this.emitResize();

	return tasks[0].start().then(() => {
		return $.when.apply(null,
			tasks.slice(1).map(task => task.start())
		);
	});
	
};

/**
 * @param {Object} baseConfig 
 * @param {Object} baseConfig.appConfig App configuration object
 * @param {Discussion} baseConfig.discussion Discussion object,
 * @param {Object} baseConfig.formData: formData (as per TaskFormWidget constructor)
 * @param {mw.Api} baseConfig.api extended mw.Api object
 * @param {Object[]} pageResultsWithOptions
 * @returns {Task[]} Tasks
 */
TaskFormWidget.prototype.prepareCloseTasks = function(baseConfig, pageResultsWithOptions) {
	const tasks = [];

	// Close discussion
	tasks.push( new CloseDiscussionTask(baseConfig, {
		target: this.formData.targetWikiext,
		rationale: this.formData.rationaleWikitext
	}) );

	// Add Old xfd templates
	const addOldXfdPageResults = pageResultsWithOptions
		.filter(pageResult => {
			const action = pageResult.options.action;
			return (action === "updatePages" ||
				action === "redirectAndUpdate" ||
				action === "disambiguateAndUpdate" ||
				action === "mergeAndUpdate"
			);
		});
	if (addOldXfdPageResults.length) {
		tasks.push(
			new AddOldXfdTask({ ...baseConfig, pageResults: addOldXfdPageResults })
		);
	}

	// Remove nomination templates
	const removeNomPageResults = pageResultsWithOptions
		.filter(pageResult => pageResult.options.action === "updatePages");
	if (removeNomPageResults.length) {
		tasks.push(
			new RemoveNomTemplatesTask({ ...baseConfig, pageResults: removeNomPageResults })
		);
	}

	// Redirect pages
	const redirectActionPageResults = pageResultsWithOptions
		.filter(pageResult => pageResult.options.action === "redirectAndUpdate");
	if (redirectActionPageResults.length) {
		tasks.push(
			new RedirectTask({ ...baseConfig, pageResults: removeNomPageResults })
		);
	}

	// Merge (not holding cell)
	const mergeActionPageResults = pageResultsWithOptions
		.filter(pageResult => pageResult.options.action === "mergeAndUpdate");
	if (mergeActionPageResults.length) {
		tasks.push(
			new AddMergeTemplatesTask({ ...baseConfig, pageResults: mergeActionPageResults })
		);
	}

	// Disambiguate
	const disambigPageResults =  pageResultsWithOptions
		.filter(pageResult => pageResult.options.action === "disambiguateAndUpdate");
	if (disambigPageResults.length) {
		tasks.push(
			new DisambiguateTask({ ...baseConfig, pageResults: disambigPageResults })
		);
	}

	// Delete
	const deletePageResults = pageResultsWithOptions
		.filter(pageResult => pageResult.options.action === "deletePages");
	if (deletePageResults.length) {
		tasks.push(
			new DeletePagesTask({ ...baseConfig, pageResults: deletePageResults })
		);
		const deleteTalkPageResults = deletePageResults.filter(pageResult => pageResult.options.deleteTalk);
		if (deleteTalkPageResults.length) {
			tasks.push(
				new DeleteTalkpagesTask({ ...baseConfig, pageResults: deleteTalkPageResults })
			);
		}
		const deleteRedirPageResults = deletePageResults.filter(pageResult => pageResult.options.deleteRedir);
		const deleteRedirDelay = $.Deferred();
		if (deleteRedirPageResults.length) {
			tasks.push(
				new DeleteRedirectsTask({ ...baseConfig, pageResults: deleteRedirPageResults, delayStart: deleteRedirDelay})
			);
		}
		const unlinkPageResults = deletePageResults.filter(pageResult => pageResult.options.unlink);
		if (unlinkPageResults.length) {
			const unlinkTask = new UnlinkBacklinksTask({ ...baseConfig, pageResults: unlinkPageResults });
			unlinkTask.finishedReadingApi.then(() => deleteRedirDelay.resolve());
			tasks.push(
				new UnlinkBacklinksTask({ ...baseConfig, pageResults: unlinkPageResults })
			);
		} else {
			deleteRedirDelay.resolve();
		}
	}

	// Holding cell
	const holdingCellPageResults = pageResultsWithOptions
		.filter(pageResult => pageResult.options.action === "holdingCell" || pageResult.options.action === "holdingCellMerge");
	if (holdingCellPageResults.length) {
		tasks.push(
			new AddBeingDeletedTask({ ...baseConfig, pageResults: holdingCellPageResults }),
			new AddToHoldingCellTask({ ...baseConfig, pageResults: holdingCellPageResults })
		);
		const tagTalkPageResuts = holdingCellPageResults.filter(pageResult => pageResult.options.tagTalk);
		if (tagTalkPageResuts.length) {
			tasks.push(
				new TagTalkWithSpeedyTask({ ...baseConfig, pageResults: tagTalkPageResuts })
			);
		}
	}

	return tasks;
};

/**
 * @param {Object} baseConfig 
 * @param {Object} baseConfig.appConfig App configuration object
 * @param {Discussion} baseConfig.discussion Discussion object,
 * @param {Object} baseConfig.formData: formData (as per TaskFormWidget constructor)
 * @param {mw.Api} baseConfig.api extended mw.Api object
 * @returns {Task[]} Tasks
 */
TaskFormWidget.prototype.prepareRelistTasks = function(baseConfig) {
	const tasks = [ new GetRelistInfoTask(baseConfig) ];
	
	switch ( appConfig.venue ) {
	case "afd":
		tasks.push(
			new UpdateDiscussionTask(baseConfig),
			new UpdateOldLogPageTask(baseConfig),
			new UpdateNewLogPageTask(baseConfig)
		);
		break;
	case "mfd":
		tasks.push( new UpdateDiscussionTask(baseConfig) );
		break;
	case "rfd":
		tasks.push(
			new UpdateOldLogPageTask(baseConfig),
			new UpdateNewLogPageTask(baseConfig)
		);
		if (!baseConfig.discussion.isBasicMode() && baseConfig.discussion.pages.length > 1) {
			tasks.push( new UpdateNomTemplatesTask(baseConfig) );
		}
		break;
	default: // ffd, tfd
		tasks.push(
			new UpdateOldLogPageTask(baseConfig),
			new UpdateNewLogPageTask(baseConfig)
		);
		if (!baseConfig.discussion.isBasicMode()) {
			tasks.push( new UpdateNomTemplatesTask(baseConfig) );
		}
		break;	
	}
	return tasks;
};

export default TaskFormWidget;
// </nowiki>