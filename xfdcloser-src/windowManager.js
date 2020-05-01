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

$( document.body ).append( manager.$element );

export default manager;