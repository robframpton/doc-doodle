var _ = require('lodash');
var compressor = require('yuicompressor');

window.onload = function() {
	var body = $('body'),
		cssPanel = $('#cssPanel'),
		editors = {},
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

	var htmlEditor = CodeMirror(
		htmlPanel.find('.editor')[0],
		{
			keymap: "sublime",
			lineNumbers: true,
			mode:  "html",
			theme: "ambiance",
			value: "<div>This is some base HTML</div>"
		}
	);

	var cssEditor = CodeMirror(
		cssPanel.find('.editor')[0],
		{
			keymap: "sublime",
			lineNumbers: true,
			mode:  "css",
			theme: "ambiance",
			value: "div {\n    background-color: red;\n    height: 100px;\n    width: 100px;\n}"
		}
	);

	var javascriptEditor = CodeMirror(
		javascriptPanel.find('.editor')[0],
		{
			keymap: "sublime",
			lineNumbers: true,
			mode:  "javascript",
			theme: "ambiance",
			value: "// This is for Javascript"
		}
	);

	editors.htmlEditor = htmlEditor;
	editors.cssEditor = cssEditor;
	editors.javascriptEditor = javascriptEditor;

	var button = $('#run');

	var jsTemplateText = '<script type="text/javascript">try {window.onload = function() {<%= script %>}()}catch(error) {}finally {console.log("End");}</script>';
	var cssTemplateText = '<style type="text/css"><%= css %></style>';

	button.on('click', function(event) {
		var styleTag = $(_.template(cssTemplateText, {css: cssEditor.doc.getValue('\n')}));
		var output = $('#outputFrame').contents().find('html');

		output.html(htmlEditor.doc.getValue('\n'));

		var outputBody = output.find('body');

		outputBody.append(styleTag);

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
				var scriptTag = $(_.template(jsTemplateText, {script: data}));
				outputBody.append(scriptTag);
			}
		});
	});

	// Toolbar

	var toggleBurger = $('.hamburger-toggle');
	var list = $('.toggle-list');

	toggleBurger.click(
		function() {
			list.toggleClass('hide');
		}
	);

	// Libraries toggle

	$('#librariesToggle').on(
		'click',
		function(event) {
			body.toggleClass('show-options');
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