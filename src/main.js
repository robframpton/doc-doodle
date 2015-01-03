/* global require, __dirname, process */

'use strict';

var app = require('app'),
	BrowserWindow = require('browser-window'),
	ipc = require('ipc'),
	dialog = require('dialog'),
	globalShortcut = require('global-shortcut');

// reports crashes to github
require('crash-reporter');

app.on( 'ready', function () {
	var mainWindow = new BrowserWindow({
		width: 1000,
		height: 900,
		title: "DocDoodle"
	});

	mainWindow.loadUrl('file://' + __dirname + '/index.html');

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	ipc.on('reload', function() {
		mainWindow.reload();
	});

	ipc.on('devTools', function() {
		mainWindow.toggleDevTools();
	});

	ipc.on('inspectElement', function(event, x, y) {
		mainWindow.inspectElement(x, y);
	});

	ipc.on('confirmLoad', function(event, target, type, options) {
		dialog.showMessageBox(mainWindow, options, function(res) {
			event.sender.send('confirmLoadResponse', res, target, type);
		});
	});

	// Register Keyboard Shortcuts

	globalShortcut.unregisterAll();

	globalShortcut.register('ctrl+r', function() {
		mainWindow.reload();
	});

	globalShortcut.register('f5', function() {
		mainWindow.reload();
	});

	globalShortcut.register('ctrl+shift+i', function() {
		mainWindow.toggleDevTools();
	});

	globalShortcut.register('f12', function() {
		mainWindow.toggleDevTools();
	});
});

app.on('window-all-closed', function() {
	app.quit();
});

