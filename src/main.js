/* global require, __dirname, process */

'use strict';

var app = require('app'),
    BrowserWindow = require('browser-window'),
    ipc = require('ipc');

var dialog = require('dialog');

// reports crashes to github
require('crash-reporter');

app.on( 'ready', function () {
    var mainWindow = new BrowserWindow({
      center: true,
      width: 1000,
      height: 900,
      title: "DocDoodle"
    });

    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    ipc.on('refresh', function() {
      mainWindow.reload();
    });

    ipc.on('devTools', function() {
      mainWindow.toggleDevTools();
    });
});

app.on('window-all-closed', function() {
  app.quit();
});

