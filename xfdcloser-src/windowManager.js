//import LoadDialog from "./Windows/LoadDialog";
import MainWindow from "./Windows/Main/MainWindow";
import PrefsWindow from "./Windows/Prefs/PrefsWindow";
import UnlinkWindow from "./Windows/Unlink/UnlinkWindow";

var factory = new OO.Factory();

// Register window constructors with the factory.
factory.register(PrefsWindow);
factory.register(MainWindow);
factory.register(UnlinkWindow);

var manager = new OO.ui.WindowManager( {
	"factory": factory
} );

$( document.body ).append( manager.$element );

export default manager;