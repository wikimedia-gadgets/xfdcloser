import Task from "../Components/Task";
// <nowiki>

function RedirectTask(config) {
	const plural = config.pageResults.length > 1;
	const label = ( config.deleteFirst )
		? `Deleting ${plural ? "pages" : "page"} and replacing with ${plural ? "redirects" : "redirect"}`
		: `Replacing ${plural ? "pages" : "page"} with ${plural ? "redirects" : "redirect"}`;
	config = { label, ...config };
	// Call parent constructor
	RedirectTask.super.call( this, config );
	// For RFD use "retarget" terminology
	if (this.venue.type === "rfd") {
		this.setLabel( config.deleteFirst 
			? `Deleting and retargeting ${plural ? "redirects" : "redirect"}`
			: `Retargeting ${plural ? "redirects" : "redirect"}`
		);
	}
}
OO.inheritClass( RedirectTask, Task );

RedirectTask.prototype.doTask = function() {
	return $.Deferred().resolve("simulated");
};

export default RedirectTask;
// </nowiki>