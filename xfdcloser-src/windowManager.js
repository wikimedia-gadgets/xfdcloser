import { $, OO } from "../globals";
import MainWindow from "./Views/MainWindow";
import UnlinkWindow from "./Views/UnlinkWindow";
import PrefsWindow from "./Views/PrefsWindow";

var factory = new OO.Factory();

// Register window constructors with the factory.
//factory.register(PrefsWindow);
factory.register(MainWindow);
factory.register(UnlinkWindow);
factory.register(PrefsWindow);

var manager = new OO.ui.WindowManager( {
	"factory": factory
} );
manager.hasOpenWindow = function() {
	const currentWindow = manager.getCurrentWindow();
	if (currentWindow && (currentWindow.isOpened() || currentWindow.isOpening())) {
		// Another dialog window is already open
		return true;
	}
	return false;
};

$( document.body ).append( manager.$element );

export default manager;