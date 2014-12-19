var gui = require ('nw.gui');

/**
 * Create native menus
 */
var win = gui.Window.get();

var menu = new gui.Menu(
	{
		type: 'menubar'
	}
);

menu.createMacBuiltin("My App");

win.menu = menu;