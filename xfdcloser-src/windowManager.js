//import LoadDialog from "./Windows/LoadDialog";
import MainWindow from "./Windows/MainWindow";
import PrefsWindow from "./Windows/PrefsWindow";

var factory = new OO.Factory();

// Register window constructors with the factory.
factory.register(PrefsWindow);
factory.register(MainWindow);

var manager = new OO.ui.WindowManager( {
	"factory": factory
} );
manager.openWindow = function(win, data) {
	let currentWindow = manager.getCurrentWindow();
	if (currentWindow && ( currentWindow.isOpened() || currentWindow.isOpening() ) ) {
		// Another dialog window is already open
		return;
	}
	return OO.ui.WindowManager.prototype.openWindow.call(this, win, data);
};
$( document.body ).append( manager.$element );

export default manager;