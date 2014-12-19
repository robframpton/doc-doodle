var _ = require('lodash');

window.onload = function() {
	var htmlPanel = $('#htmlPanel')[0],
		cssPanel = $('#cssPanel')[0],
		javascriptPanel = $('#javascriptPanel')[0],
		editors = {};

	var htmlEditor = CodeMirror(
		htmlPanel,
		{
			keymap: "sublime",
			lineNumbers: true,
			mode:  "html",
			theme: "ambiance",
			value: "<div>This is some base HTML</div>"
		}
	);

	var cssEditor = CodeMirror(
		cssPanel,
		{
			keymap: "sublime",
			lineNumbers: true,
			mode:  "css",
			theme: "ambiance",
			value: "div {\n    background-color: red;\n    height: 100px;\n    width: 100px;\n}"
		}
	);

	var javascriptEditor = CodeMirror(
		javascriptPanel,
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

	button.on('click', function(event) {
		var cssContent = cssEditor.doc.getValue();
		var htmlContent = htmlEditor.doc.getValue();
		var jsContent = javascriptEditor.doc.getValue();
		var styleTag = $('<style type="text/css">' + cssContent + '</style>');
		var scriptTag = $('<script>' + jsContent + '</script>');
		var output = $('#outputFrame').contents().find('html');

		output.html(htmlContent);

		var outputBody = output.find('body');

		outputBody.append(styleTag);
		outputBody.append(scriptTag);
	});

	// Toolbar

	var toggleBurger = $('.hamburger-toggle');
	var list = $('.toggle-list');

	toggleBurger.click(
		function() {
			list.toggleClass('hide');
		}
	);
};