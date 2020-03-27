import {hasCorrectNamespace, multiButtonConfirm, setExistence} from "../../util";
import appConfig from "../../config";
import API from "../../api";
import Task from "../Components/Task";
import closeDiscussion from "../Tasks/closeDiscussion";
import ResizingMixin from "../Mixins/ResizingMixin";
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
		.catch(reason => this.emit("cancelled", reason)); // TODO: Abort everything. Either close window, or return to previous page.

	// Simulate tasks being completed: 
	// window.setTimeout(
	// 	() => this.setFinished(),
	// 	1100
	// );
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
	
	const expectedNamespace = appConfig.mw.namespaces[(appConfig.venue.ns_number[0]).toString()];
	// Check target page namespace:
	var targetTitles = isMultimode
		? [this.formData.targetTitle]
		: this.formData.pageResults
			.filter(pr => pr.data && pr.data.target)
			.map(pr => mw.title.newFromText(pr.data.target));
	targetTitles.forEach(target => {
		if (target && !hasCorrectNamespace(target)) {
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
	// TODO: Use actual, specific Task widgets (and determine which tasks to add)
	const baseConfig = {
		appConfig: appConfig,
		discussion: this.discussion,
		formData: this.formData,
		api: API
	};
	const tasks = [
		this.type === "close"
			? new closeDiscussion(baseConfig)
			: new Task({
				...baseConfig,
				label: "Task One"
			}),
		new Task({
			...baseConfig,
			label: "Task Two"
		}),
		new Task({
			...baseConfig,
			label: $("<span>").append(["Task ", extraJs.makeLink("Three")])
		}),
		new Task({
			...baseConfig,
			label: "Task Four"
		}),
	];
	tasks.forEach( task => task.connect(this, {"resize": "emitResize"}) );
	this.tasksFieldset.addItems( tasks );
	this.emitResize();

	tasks[0].start().then(() => {
		// Simulate tasks states
		tasks[1].setTotalSteps(10);
		tasks[1].trackStep();
		tasks[1].trackStep({failed: true});
		tasks[1].addError("Could not edit something");

		tasks[2].addWarning("Pagenamehere skipped: Could not find nomination template");

		tasks[3].addError("Some sort of error happened");
		tasks[3].addError("A Second Error!");
		tasks[3].addWarning("Something to warn you about");
		tasks[3].addWarning("Another warning");
		tasks[3].addWarning("Yet another warning");
	});
	
};

export default TaskFormWidget;
// </nowiki>