import { OO } from "../../globals";
import TaskItem from "./TaskItem";
// <nowiki>

class TaskList {
	/**
	 * 
	 * @param {Object} config
	 *  @param {Discussion} config.discussion
	 *  @param {Result} config.result
	 *  @param {Options} config.options
	 *  @param {String} [config.label] Heading label, default is "Tasks"
	 */
	constructor(config) {
		// call mixin constructors
		OO.EventEmitter.call(this);
		OO.EmitterList.call(this);

		this.discussion = config.discussion;
		this.result = config.result;
		this.options = config.options;
		this.label = config.label || "Tasks";
		this.type = config.type;
		this.userIsSysop = config.userIsSysop;

		this.started = false;
		this.done = false;
		this.aborted = false;
		this.allFailed = false;
	
		this.result.connect(this, {"update": "resetItems"});
		this.options.connect(this, {
			"update": "resetItems",
			"itemUpdate": "resetItems"
		});
		// this.aggregate({update: "itemUpdate"});
		// this.connect(this, {itemUpdate: ["emit", "update"]});
	}

	get success() {
		return this.done && !this.allFailed;
	}

	makeItemsForClose() {
		const resultsbyPage = this.result.getResultsByPage();
		const tasks = [];

		// Close discussion
		const closeDiscussionTask = new TaskItem({
			taskName: "CloseDiscussion",
			discussion: this.discussion,
			result: this.result,
		});
		tasks.push(closeDiscussionTask);
	
		// Add Old xfd templates
		const addOldXfdPageResults = resultsbyPage.filter(result => {
			const optionValues = this.options.getOptionValues(result.selectedResultName);
			const action = optionValues && optionValues.action;
			return (action === "updatePages" ||
				action === "redirectAndUpdate" ||
				action === "disambiguateAndUpdate" ||
				action === "mergeAndUpdate"
			);
		});
		if ( addOldXfdPageResults.length ) {
			tasks.push(
				new TaskItem({
					taskName: "AddOldXfd",
					relaventPageNames: addOldXfdPageResults.map(result => result.pageName),
					discussion: this.discussion,
					result: this.result,
					options: this.options
				})
			);
		}
	
		// Remove nomination templates
		const removeNomPageResults = resultsbyPage.filter(result => {
			const optionValues = this.options.getOptionValues(result.selectedResultName);
			return optionValues && optionValues.action === "updatePages";
		});
		if ( removeNomPageResults.length ) {
			tasks.push(
				new TaskItem({
					taskName: "RemoveNomTemplates",
					relaventPageNames: removeNomPageResults.map(result => result.pageName),
					discussion: this.discussion,
					result: this.result,
					options: this.options
				})
			);
		}
	
		// Redirect pages
		const redirectActionPageResults = resultsbyPage.filter(result => {
			const optionValues = this.options.getOptionValues(result.selectedResultName);
			return optionValues && optionValues.action === "redirectAndUpdate";
		});
		if (redirectActionPageResults.length) {
			tasks.push(
				new TaskItem({
					taskName: "Redirect",
					relaventPageNames: redirectActionPageResults.map(result => result.pageName),
					discussion: this.discussion,
					result: this.result,
					options: this.options
				})
			);
			const notSoftRedirectPageResults = redirectActionPageResults.filter(result => !result.isSoft());
			if (notSoftRedirectPageResults.length) {
				tasks.push(
					new TaskItem({
						taskName: "RemoveCircularLinks",
						relaventPageNames: notSoftRedirectPageResults.map(result => result.pageName),
						discussion: this.discussion,
						result: this.result,
						options: this.options
					})
				);
			}
		}
	
		// Merge (not holding cell)
		const mergeActionPageResults = resultsbyPage.filter(result => {
			const optionValues = this.options.getOptionValues(result.selectedResultName);
			return optionValues && optionValues.action === "mergeAndUpdate";
		});
		if ( mergeActionPageResults.length ) {
			tasks.push(
				new TaskItem({
					taskName: "AddMergeTemplates",
					relaventPageNames: mergeActionPageResults.map(result => result.pageName),
					discussion: this.discussion,
					result: this.result,
					options: this.options
				})
			);
		}
	
		// Disambiguate
		const disambigPageResults =  resultsbyPage.filter(result => {
			const optionValues = this.options.getOptionValues(result.selectedResultName);
			return optionValues && optionValues.action === "disambiguateAndUpdate";
		});
		if ( disambigPageResults.length ) {
			tasks.push(
				new TaskItem({
					taskName: "Disambiguate",
					relaventPageNames: disambigPageResults.map(result => result.pageName),
					discussion: this.discussion,
					result: this.result,
					options: this.options
				})
			);
		}
	
		// Delete
		const deletePageResults = resultsbyPage.filter(result => {
			const optionValues = this.options.getOptionValues(result.selectedResultName);
			return optionValues && optionValues.action === "deletePages";
		});
		if ( deletePageResults.length ) {
			tasks.push(
				new TaskItem({
					taskName: "DeletePages",
					relaventPageNames: deletePageResults.map(result => result.pageName),
					discussion: this.discussion,
					result: this.result,
					options: this.options
				})
			);
			const deleteTalkPageResults = deletePageResults.filter(result => {
				const optionValues = this.options.getOptionValues(result.selectedResultName);
				return optionValues && optionValues.deleteTalk;
			});
			if ( deleteTalkPageResults.length ) {
				tasks.push(
					new TaskItem({
						taskName: "DeleteTalkpages",
						relaventPageNames: deleteTalkPageResults.map(result => result.pageName),
						discussion: this.discussion,
						result: this.result,
						options: this.options
					})
				);
			}
			const deleteRedirPageResults = deletePageResults.filter(result => {
				const optionValues = this.options.getOptionValues(result.selectedResultName);
				return optionValues && optionValues.deleteRedir;
			});
			if ( deleteRedirPageResults.length )  {
				tasks.push(
					new TaskItem({
						taskName: "DeleteRedirects",
						relaventPageNames: deleteRedirPageResults.map(result => result.pageName),
						discussion: this.discussion,
						result: this.result,
						options: this.options
					})
				);
			}
			const unlinkPageResults = deletePageResults.filter(result => {
				const optionValues = this.options.getOptionValues(result.selectedResultName);
				return optionValues && optionValues.unlink;
			});
			if ( unlinkPageResults.length ) {
				tasks.push(
					new TaskItem({
						taskName: "UnlinkBacklinks",
						relaventPageNames: unlinkPageResults.map(result => result.pageName),
						discussion: this.discussion,
						result: this.result,
						options: this.options
					})
				);
			}
			if ( deleteRedirPageResults.length && unlinkPageResults.length ) {
				// Delay start of delete redirects task until the unlink task is raedy
				const deleteRedirTask = tasks[tasks.length-2];
				const unlinkTask = tasks[tasks.length-1];
				deleteRedirTask.setPrecedingTask(unlinkTask, "doing");
			}
		}
	
		// Holding cell
		const holdingCellPageResults = resultsbyPage.filter(result => {
			const optionValues = this.options.getOptionValues(result.selectedResultName);
			const action = optionValues && optionValues.action;
			return action === "holdingCell" || action === "holdingCellMerge";
		});
		if (holdingCellPageResults.length) {
			tasks.push(
				new TaskItem({
					taskName: "AddBeingDeleted",
					relaventPageNames: holdingCellPageResults.map(result => result.pageName),
					discussion: this.discussion,
					result: this.result,
					options: this.options
				}),
				new TaskItem({
					taskName: "AddToHoldingCell",
					relaventPageNames: holdingCellPageResults.map(result => result.pageName),
					discussion: this.discussion,
					result: this.result,
					options: this.options
				})
			);
			const tagTalkPageResuts = holdingCellPageResults.filter(result => {
				const optionValues = this.options.getOptionValues(result.selectedResultName);
				return optionValues && optionValues.tagTalk;
			});
			if ( tagTalkPageResuts.length ) {
				tasks.push(
					new TaskItem({
						taskName: "TagTalkWithSpeedy",
						relaventPageNames: tagTalkPageResuts.map(result => result.pageName),
						discussion: this.discussion,
						result: this.result,
						options: this.options
					})
				);
			}
		}

		tasks.slice(1).forEach(task => {
			if ( !task.precedingTask ) {
				task.setPrecedingTask(closeDiscussionTask, "done");
			}
		});
		return tasks;
	}

	makeItemsForRelist() {
		const relistInfoTask = new TaskItem({
			taskName: "GetRelistInfo",
			discussion: this.discussion,
			result: this.result,
		});
		const tasks = [
			relistInfoTask,
			...this.discussion.venue.relistTasks.flatMap(taskName => {
				if ( taskName === "UpdateNomTemplates" && this.discussion.pages.length === 0 ) {
					return [];
				}
				return new TaskItem({
					taskName,
					relaventPageNames: this.discussion.pagesNames,
					discussion: this.discussion,
					result: this.result,
					options: this.options
				});
			})
		];
		tasks.slice(1).forEach(task => task.setPrecedingTask(relistInfoTask, "done"));

		return tasks;
	}

	resetItems() {
		this.clearItems();
		this.emit("update");
		this.addItems( this.type === "close"
			? this.makeItemsForClose()
			: this.makeItemsForRelist()
		);
		this.emit("update");
	}

	startTasks() {
		if ( this.started ) { return false; }
		this.started = true;
		if (!this.getItems().length) {
			this.resetItems();
		}
		this.getItems()[0].start(); //forEach(item => item.start());
		this.emit("update");
	}

	abort() {
		this.getItems().forEach(taskItem => { taskItem.setAborted(); });
		if ( this.getItems().some(taskItem => taskItem.aborted) ) {
			this.setAborted();
		}
	}

	setAborted() {
		this.label = "Aborted";
		this.aborted = true;
		this.emit("update");	}

	setDone() {
		this.done = true;
		this.emit("update");
	}

	setAllFailed() {
		this.done = true;
		this.allFailed = true;
		this.emit("update");
	}

	onItemUpdate() {
		if ( this.getItems().some(task => task.aborted) ) {
			this.abort();
		} else if ( this.getItems().every(task => task.failed) ) {
			this.setAllFailed();
		} else if ( this.getItems().every(task => task.done || task.failed) ) {
			this.setDone();
		}
		this.emit("update");
	}

}
OO.initClass( TaskList );
OO.mixinClass( TaskList, OO.EventEmitter );
OO.mixinClass( TaskList, OO.EmitterList );

export default TaskList;
// </nowiki>