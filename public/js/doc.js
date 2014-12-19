window.onload = function() {
	var htmlPanel = $('#htmlPanel'),
		cssPanel = $('#cssPanel'),
		javascriptPanel = $('#javascriptPanel'),
		editors = {};

	var htmlEditor = CodeMirror(
		htmlPanel[0],
		{
			keymap: "sublime",
			lineNumbers: true,
			mode:  "html",
			theme: "ambiance",
			value: "This is for HTML"
		}
	);

	var cssEditor = CodeMirror(
		cssPanel[0],
		{
			keymap: "sublime",
			lineNumbers: true,
			mode:  "css",
			theme: "ambiance",
			value: "This is for CSS"
		}
	);

	var javascriptEditor = CodeMirror(
		javascriptPanel[0],
		{
			keymap: "sublime",
			lineNumbers: true,
			mode:  "javascript",
			theme: "ambiance",
			value: "This is for Javascript"
		}
	);

	editors.htmlEditor = htmlEditor;
	editors.cssEditor = cssEditor;
	editors.javascriptEditor = javascriptEditor;
};