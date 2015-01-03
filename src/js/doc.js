var _ = require('lodash');
var fs = require('fs');
var compressor = require('yuicompressor');
var ipc = require('ipc');
var remote = require('remote');

var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

var CWD = process.cwd();

window.onload = function() {
	var $ = require('../lib/js/jquery-2.1.3.min.js'),
		body = $('body'),
		CSSEditor,
		CSSPanel = $('#CSSPanel'),
		doodlesMenu = $('#doodlesMenu'),
		HTMLEditor,
		HTMLPanel = $('#HTMLPanel'),
		JSEditor,
		JSPanel = $('#JSPanel'),
		templateList = $('.template-list'),
		win = $(window),
		menu = new Menu(),
		mouseX,
		mouseY;


	// Context Menu

	menu.append(new MenuItem(
		{
			label: 'Reload App',
			click: function() {
				ipc.send('reload');
			}
		}
	));

	menu.append(new MenuItem(
		{
			label: 'Inspect Element',
			click: function() {
				ipc.send('inspectElement', mouseX, mouseY);
			}
		}
	));

	window.addEventListener('contextmenu', function (e) {
		e.preventDefault();
		mouseX = e.x;
		mouseY = e.y;
		menu.popup(remote.getCurrentWindow());
	}, false);

	// Templates

	var doodleListTemplate = '<li class="doodle" data-filename="<%= fileName %>" data-type="<%= type %>"><%= doodleName %></li>',
		JSTemplate = 'window.onload=function(){try{<%= script %>}catch(e){}};';

	function createEditor(config) {
		var editor = CodeMirror(
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

		editor.on(
			'change',
			_.debounce(
				function(editor) {
					var value = editor.doc.getValue();

					config.changeFn(value);
				},
				200
			)
		);

		return editor;
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

	function renderDoodleList(type, template, list) {
		fs.readdir(
			type + '/',
			function(err, files) {
				if (!err) {
					if (files.length) {
						var buffer = _.map(
							files,
							function(item, index) {
								var doodleName = item.match(/(.*)\./);

								return _.template(
									template,
									{
										doodleName: doodleName[1],
										fileName: item,
										type: type
									}
								);
							}
						);

						doodlesMenu.find(list).html(buffer.join(''));
					}
				}
				else {
					if (err.code === "ENOENT") {
						fs.mkdir(type + '/', function(err) {
							if (!err) {
								renderDoodleList(type, template, list);
							}
						});
					}
					else {
						console.log('err: ', err);
					}
				}
			}
		);
	}

	function renderDoodleTemplateList() {
		renderDoodleList('doodle-templates', doodleListTemplate, '.doodle-template-list');
	}

	function renderSavedDoodleList() {
		renderDoodleList('doodles', doodleListTemplate, '.doodle-list');
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
			changeFn: updateHTML,
			mode: 'htmlmixed',
			panel: HTMLPanel,
			placeholder: 'HTML goes here...'
		}
	);

	CSSEditor = createEditor(
		{
			changeFn: updateCSS,
			mode: 'css',
			panel: CSSPanel,
			placeholder: 'CSS goes here...'
		}
	);

	JSEditor = createEditor(
		{
			changeFn: updateJS,
			mode: 'javascript',
			panel: JSPanel,
			placeholder: 'Javascript goes here...'
		}
	);

	updateAll();
	renderSavedDoodleList();
	renderDoodleTemplateList();

	// Toolbar Actions

	$('.open-dev-tools').on(
		'click',
		function() {
			ipc.send('devTools');
		}
	);

	$('.reload').on(
		'click',
		function() {
			ipc.send('reload');
		}
	);

	// Save / Load Menu

	$('#doodlesToggle').on(
		'click',
		function() {
			body.toggleClass('doodles-menu-open');
		}
	);

	$('.save-doodle').on(
		'click',
		function() {
			var name = $('#newDoodleName').val();

			if (name) {
				saveDoodle(name);

				renderSavedDoodleList();
			}
			else {
				alert('Please enter a name for your Doodle.');
			}
		}
	);

	$('#loadDoodle .doodle-list, #doodleTemplates .doodle-template-list').on(
		'click',
		'li',
		function(event) {
			var options = {
				message: 'Are you sure you want to load this Doodle?',
				detail: 'All current data will be lost.',
				buttons: ['Cancel', 'Load']
			};

			var fileName = $(event.currentTarget).data('filename');
			var fileType = $(event.currentTarget).data('type');

			ipc.send('confirmLoad', fileName, fileType, options);
		}
	);

	ipc.on('confirmLoadResponse', function(load, fileName, fileType) {
		if (load) {
			fs.readFile(
				CWD + '/' + fileType + '/' + fileName,
				{
					encoding: 'utf8'
				},
				function(err, data) {
					if (err) throw err;

					data = JSON.parse(data);

					populateEditors(data);

					body.removeClass('doodles-menu-open');
				}
			);
		}
	});

	// Editor options overlay toggle

	$('.options-toggle').on(
		'click',
		function(event) {
			currentTarget = $(event.currentTarget);

			var optionsPanel = currentTarget.next('.options');

			optionsPanel.toggleClass('open');
		}
	);
};