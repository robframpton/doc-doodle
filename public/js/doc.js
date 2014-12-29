var _ = require('lodash');
var fs = require('fs');
var compressor = require('yuicompressor');

var CWD = process.cwd();

window.onload = function() {
	var body = $('body'),
		CSSEditor,
		CSSPanel = $('#CSSPanel'),
		HTMLEditor,
		HTMLPanel = $('#HTMLPanel'),
		JSEditor,
		JSPanel = $('#JSPanel'),
		JSTemplate = 'window.onload=function(){try{<%= script %>}catch(e){}};',
		templateList = $('.template-list'),
		win = $(window);

	// Panel height

	function createEditor(config) {
		return CodeMirror(
			config.panel.find('.editor')[0],
			{
				keyMap: "sublime",
				lineNumbers: true,
				lineWrapping: true,
				mode:  config.mode,
				showCursorWhenSelecting: true,
				styleActiveLine: true,
				theme: "ambiance",
				placeholder: config.placeholder
			}
		);
	}

	function createToggler(toggler, content) {
		toggler = $(toggler);
		content = $(content);

		toggler.on(
			'click',
			function(event) {
				if (!content.hasClass('hide')) {
					return content.toggleClass('hide');
				}

				$('.dropdown-list').each(
					function() {
						if (!$(this).hasClass('hide')) {
							$(this).addClass('hide');
						}
					}
				);

				content.toggleClass('hide');

				toggler.toggleClass('open', !content.hasClass('hide'));
			}
		);
	}

	function populateEditors(data) {
		if (data.html) {
			HTMLEditor.doc.setValue(data.html);
		}

		if (data.css) {
			CSSEditor.doc.setValue(data.css);
		}

		if (data.js) {
			JSEditor.doc.setValue(data.js);
		}
	}

	function renderDoodleList() {
		fs.readdir(
			'doodles/',
			function(err, files) {
				if (files.length) {
					var buffer = _.map(
						files,
						function(item, index) {
							var doodleName = item.match(/(.*)\./);

							return '<li class="doodle" data-filename="' + item + '">' + doodleName[1] + '</li>';
						}
					);

					$('#loadDoodle .doodle-list').html(buffer.join(''));
				}
			}
		);
	}

	function resizePanels() {
		var containerHeight = win.height() - ($('.navbar').outerHeight() * 2);

		var panelHeight = (containerHeight / 2) - 10;

		$('.editor, #outputFrame').css('height', panelHeight + 'px');
	}

	function refreshIframe() {
		console.log('Reloading iframe...');

		var iframe = $('#outputFrame')[0];

		iframe.src = iframe.src;
	}

	function rightOutputFile(editor, value, config) {
		if (!value) {
			value = editor.doc.getValue();
		}

		fs.writeFile(
			'output/output-fragments/' + config.fileName,
			value,
			function (err) {
				if (!err) {
					if (config.message) {
						console.log(config.message);
					}

					refreshContent();
				}
			}
		);
	}

	function saveDoodle(name) {
		var data = {
			css: CSSEditor.doc.getValue(),
			html: HTMLEditor.doc.getValue(),
			js: JSEditor.doc.getValue()
		};

		fs.writeFile(
			'doodles/' + name + '.json',
			JSON.stringify(data),
			function (err) {
				if (err) {
					console.log(err);
				}
				else {
					console.log(name + ' has been saved.');
				}
			}
		);
	}

	var refreshContent = _.debounce(refreshIframe, 200);

	function updateAll() {
		updateHTML();
		updateCSS();
		updateJS();
	}

	function updateCSS(value) {
		rightOutputFile(
			CSSEditor,
			value,
			{
				fileName: 'css.css',
				message: 'CSS saved!'
			}
		);
	}

	function updateHTML(value) {
		rightOutputFile(
			HTMLEditor,
			value,
			{
				fileName: 'html.html',
				message: 'HTML saved!'
			}
		);
	}

	function updateJS(value) {
		if (!value) {
			value = JSEditor.doc.getValue();
		}

		compressor.compress(
			value,
			{
				'line-break': 80,
				charset: 'utf8',
				nomunge: true,
				type: 'js'
			},
			function(err, data) {
				if (err) {
					console.log(err);
				}
				else {
					value = _.template(
						JSTemplate,
						{
							script: data
						}
					);

					rightOutputFile(
						JSEditor,
						value,
						{
							fileName: 'js.js',
							message: 'Javascript saved!'
						}
					);
				}
			}
		);
	}

	resizePanels();

	win.on('resize', resizePanels);

	HTMLEditor = createEditor(
		{
			mode: 'htmlmixed',
			panel: HTMLPanel,
			placeholder: 'HTML goes here...'
		}
	);

	CSSEditor = createEditor(
		{
			mode: 'css',
			panel: CSSPanel,
			placeholder: 'CSS goes here...'
		}
	);

	JSEditor = createEditor(
		{
			mode: 'javascript',
			panel: JSPanel,
			placeholder: 'Javascript goes here...'
		}
	);

	HTMLEditor.on(
		'change',
		_.debounce(function(editor) {
			var value = editor.doc.getValue();

			updateHTML(value);
		}, 200)
	);

	CSSEditor.on(
		'change',
		_.debounce(function(editor) {
			var value = editor.doc.getValue();

			updateCSS(value);
		}, 200)
	);

	JSEditor.on(
		'change',
		_.debounce(function(editor) {
			var value = editor.doc.getValue();

			updateJS(value);
		}, 200)
	);

	updateAll();
	renderDoodleList();

	createToggler('#menuToggle', '.toggle-list');

	// Toolbar

	$('.open-dev-tools').on(
		'click',
		function() {
			gui.Window.get().showDevTools();
		}
	);

	$('.reload').on(
		'click',
		function() {
			gui.Window.get().reload();
		}
	);

	$('.save-doodle').on(
		'click',
		function() {
			var name = $('#newDoodleName').val();

			if (name) {
				saveDoodle(name);

				renderDoodleList();
			}
			else {
				alert('Please enter a name for your Doodle.');
			}
		}
	);

	$('#doodlesToggle').on(
		'click',
		function() {
			body.toggleClass('doodles-menu-open');
		}
	);

	$('#loadDoodle .doodle-list').on(
		'click',
		'li',
		function(event) {
			var currentTarget = $(event.currentTarget);

			var fileName = currentTarget.data('filename');

			fs.readFile(
				CWD + '/doodles/' + fileName,
				{
					encoding: 'utf8'
				},
				function(err, data) {
					if (err) throw err;

					data = JSON.parse(data);

					populateEditors(data);
				}
			);
		}
	);

	// Template functions
	var tempMessage = 'Are you sure you want to change markup? All data will be lost.';

	var clickableButton = $('#clickButton');

	clickableButton.click(
		function() {
			fs.readFile(CWD + '/templates/onClick.html', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					HTMLEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/onClick.css', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					CSSEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/onClick.js', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					JSEditor.doc.setValue(data);
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
					HTMLEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/firstParagraph.css', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					CSSEditor.doc.setValue(data);
				}
			);

			JSEditor.doc.setValue('// Do something here');

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