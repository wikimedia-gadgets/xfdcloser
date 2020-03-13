// <nowiki>

function TaskGroup(discussion, data) {
	// Configuration initialization
	config = {};
	// Call parent constructor
	TaskGroup.super.call( this, config );
	// Mixin constructor
	OO.ui.mixin.GroupElement.call( this, $.extend( {
		$group: this.$element
    }, config ) );
    
    this.discussion = discussion;
}
OO.inheritClass( TaskGroup, OO.ui.Widget );
OO.mixinClass( TaskGroup, OO.ui.mixin.GroupElement );

export default TaskGroup;
// </nowiki>