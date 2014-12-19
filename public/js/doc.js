window.onload = function() {
	var cssPanel = $('#cssPanel'),
		htmlPanel = $('#htmlPanel'),
		javascriptPanel = $('#javascriptPanel');

	var cssEditor = CodeMirror(
		cssPanel[0],
		{
			value: "function myScript(){return 100;}\n",
			mode:  "css"
		}
	);

	var htmlEditor = CodeMirror(
		htmlPanel[0],
		{
			value: "function myScript(){return 100;}\n",
			mode:  "html"
		}
	);

	var javascriptEditor = CodeMirror(
		javascriptPanel[0],
		{
			value: "function myScript(){return 100;}\n",
			mode:  "javascript"
		}
	);
}