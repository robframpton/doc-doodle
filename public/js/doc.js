var _ = require('lodash');
var fs = require('fs');
var compressor = require('yuicompressor');

var CWD = process.cwd();

window.onload = function() {
	var body = $('body'),
		cssPanel = $('#cssPanel'),
		htmlPanel = $('#htmlPanel'),
		javascriptPanel = $('#javascriptPanel'),
		win = $(window);

	// Panel height

	function resizePanels() {
		var windowHeight = win.height();
		var navbarHeight = $('.navbar').outerHeight() * 2;
		var containerHeight = windowHeight - navbarHeight;

		var panelHeight = (containerHeight / 2) - 10;

		$('.editor, #outputFrame').css('height', panelHeight + 'px');
	}

	resizePanels();

	win.on('resize', resizePanels);

	function createEditor(config) {
		return CodeMirror(
			config.panel.find('.editor')[0],
			{
				keymap: "sublime",
				lineNumbers: true,
				mode:  config.mode,
				theme: "ambiance",
				value: config.value
			}
		);
	}

	var htmlEditor = createEditor(
		{
			mode: 'html',
			panel: htmlPanel,
			value: '<div>html</div>'
		}
	);

	var cssEditor = createEditor(
		{
			mode: 'css',
			panel: cssPanel,
			value: 'div {\n    background-color: red;\n    height: 100px;\n    width: 100px;\n}'
		}
	);

	var javascriptEditor = createEditor(
		{
			mode: 'javascript',
			panel: javascriptPanel,
			value: '// This is for Javascript'
		}
	);

	var button = $('#run');

	button.on('click', function(event) {
		var output = $('#outputFrame').contents().find('html');
		var outputHead = output.find('head');

		output.find('body').html(htmlEditor.doc.getValue('\n'));

		output.find('#customCSS').html(cssEditor.doc.getValue('\n'));

		compressor.compress(javascriptEditor.doc.getValue('\n'), {
			charset: 'utf8',
			type: 'js',
			nomunge: true,
			'line-break': 80
		}, function(err, data) {
			if (err) {
				console.log(err);
				$('#error-display').html(err);
			}
			else {
				output.find('#customJS').html(data);
			}
		});
	});

	// Toolbar

	var openDevTools = $('.open-dev-tools');

	openDevTools.on('click', function() {
		gui.Window.get().showDevTools();
	});

	var toggleBurger = $('.hamburger-toggle');
	var settings = $('.toggle-list');

	var templatesToggle = $('#templatesToggle');
	var templateList = $('.template-list');

	toggleBurger.click(
		function() {
			settings.toggleClass('hide');

			if (!templateList.hasClass('hide')) {
				templateList.toggleClass('hide');
			}
		}
	);

	templatesToggle.click(
		function() {
			templateList.toggleClass('hide');

			if (!settings.hasClass('hide')) {
				settings.toggleClass('hide');
			}
		}
	);

	// Template functions
	var tempMessage = 'Are you sure you want to change markup? All data will be lost.';

	var clickableButton = $('#clickButton');

	clickableButton.click(
		function() {
			fs.readFile(CWD + '/templates/onClick.html', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					htmlEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/onClick.css', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					cssEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/onClick.js', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					javascriptEditor.doc.setValue(data);
				}
			);

			templateList.toggleClass('hide');
		}
	);

	var firstParagraph = $('#firstParagraph');

	firstParagraph.click(
		function() {
			fs.readFile(CWD + '/templates/firstParagraph.html', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					htmlEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/firstParagraph.css', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					cssEditor.doc.setValue(data);
				}
			);

			javascriptEditor.doc.setValue('// Do something here');

			templateList.toggleClass('hide');
		}
	);

	// Options toggle

	$('.options-toggle').on(
		'click',
		function(event) {
			currentTarget = $(event.currentTarget);

			var optionsPanel = currentTarget.next('.options');

			optionsPanel.toggleClass('open');
		}
	);
};