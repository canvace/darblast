Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext.ux': '/extjs/ux/'
	}
});

(function () {
	var width = screen.availWidth;
	var height = screen.availHeight;

	Canvace.initGUI = function () {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: {
				layout: 'border',
				bbar: Ext.create('Ext.ux.statusbar.StatusBar', {
					text: 'Ready',
					iconCls: 'x-status-valid'
				}),
				items: [{
					region: 'center',
					layout: 'fit',
					items: {
						xtype: 'box',
						region: 'center',
						html: '<canvas id="canvas"></canvas>',
						style: {
							overflow: 'hidden'
						}
					},
					lbar: {
						xtype: 'toolbar',
						id: 'toolbar',
						defaults: {
							scale: 'large',
							allowDepress: false
						},
						items: [{
							icon: '/resources/images/tools/save.png',
							tooltip: 'Save'
						}, {
							icon: '/resources/images/tools/export.png',
							tooltip: 'Export...'
						}, {
							icon: '/resources/images/tools/bug.png',
							tooltip: 'Report a bug...'
						}]
					}
				}, {
					region: 'east',
					weight: -1,
					collapsible: true,
					split: true,
					header: false,
					width: 250,
					title: 'Stages and Layers',
					layout: 'fit',
					items: {
						xtype: 'tabpanel',
						tabPosition: 'bottom',
						items: [{
							id: 'stage-controls',
							title: 'Project',
							layout: 'border'
						}, {
							title: 'Layers',
							layout: 'vbox'
						}]
					}
				}, {
					xtype: 'tabpanel',
					id: 'lower-panel',
					region: 'south',
					weight: -2,
					collapsible: true,
					collapsed: true,
					split: true,
					title: 'Images and Elements',
					header: false,
					height: 200
				}]
			}
		});

		Ext.get('canvas').set({
			width: width,
			height: height
		}).setStyle({
			backgroundColor: 'white'
		});
	};

	Canvace.loadStage = function (projectId, id) {
		Canvace.poller = new Poller(projectId);
		var loader = new Loader(function () {
			var stage;
			try {
				stage = Canvace.stages.get(id);
			} catch (e) {
				Ext.MessageBox.show({
					title: 'Error',
					msg: 'The specified stage does not exist.',
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR
				});
				return;
			}
			stage.load(function (data) {
				Canvace.view = new View(data.matrix, data.x0, data.y0);
				Canvace.buckets = new Buckets(width, height);
				Canvace.history = new History();
				Canvace.array = new TileArray(data.map);
				Canvace.instances = new Instances(data.instances);
				Canvace.layers = new Layers();
				Canvace.selection = new Selection();
				Canvace.tileClipboard = new TileClipboard();
				Canvace.entityClipboard = new EntityClipboard();
				Canvace.cursor = new Cursor();
				Canvace.renderer = new Renderer();
				Canvace.tools = new Tools();
				Canvace.tools.addToolButtons();
				Canvace.renderer.render();
			});
		});
		loader.queue(function (callback) {
			Canvace.stages = new Stages(function () {
				Canvace.stageControls = new StageControls();
				callback();
			});
		});
		loader.queue(function (callback) {
			Canvace.images = new Images(function () {
				Canvace.imageControls = new ImageControls();
				callback();
			});
		});
		loader.queue(function (callback) {
			Canvace.tiles = new Tiles(function () {
				Canvace.tileControls = new TileControls();
				callback();
			});
		});
		loader.queue(function (callback) {
			Canvace.entities = new Entities(function () {
				Canvace.entityControls = new EntityControls();
				callback();
			});
		});
		loader.allQueued();
	};

	Ext.define('Canvace.projection.Gripper', {
		extend: 'Ext.Img',
		alias: 'widget.projectiongripper',

		floating: true,
		shadow: false,
		draggable: true,
		constrain: true,
		constrainTo: Ext.getBody(),

		constructor: function (config) {
			this.callParent(arguments);

			if (!('matrixColumn' in config)) {
				throw '"matrixColumn" is mandatory';
			}
		}
	});

	Canvace.showStartScreen = function () {
		var startDialog = new Ext.window.Window({
			title: 'Canvace Development Environment',
			modal: true,
			closable: false,
			resizable: false,
			layout: 'accordion',
			items: [{
				title: 'Create new project',
				layout: 'fit',
				items: new CustomForm({
					url: '/',
					method: 'POST',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					items: [{
						xtype: 'textfield',
						name: 'path',
						fieldLabel: 'Project path',
						width: 400,
						allowBlank: false
					}, {
						xtype: 'fieldset',
						title: 'Projection matrix',
						layout: {
							type: 'hbox',
							align: 'stretch'
						},
						items: [{
							xtype: 'container',
							layout: {
								type: 'table',
								columns: 3
							},
							defaultType: 'numberfield',
							defaults: {
								size: 4,
								allowBlank: false,
								allowDecimals: true,
								hideTrigger: true,
								selectOnFocus: true
							},
							items: [{
								id: 'matrix-field-11',
								value: -48
							}, {
								id: 'matrix-field-12',
								value: 48
							}, {
								id: 'matrix-field-13',
								value: 0
							}, {
								id: 'matrix-field-21',
								value: 24
							}, {
								id: 'matrix-field-22',
								value: 24
							}, {
								id: 'matrix-field-23',
								value: -48
							}, {
								id: 'matrix-field-31',
								value: 1
							}, {
								id: 'matrix-field-32',
								value: 1
							}, {
								id: 'matrix-field-33',
								value: 1
							}]
						}, {
							xtype: 'container',
							layout: 'absolute',
							items: [{
								xtype: 'container',
								html: '<canvas id="projection-canvas" width="150" height="150"></canvas>'
							}, {
								xtype: 'projectiongripper',
								id: 'projection-gripper-i',
								src: '/resources/images/grippers/i.png',
								matrixColumn: 0
							}, {
								xtype: 'projectiongripper',
								id: 'projection-gripper-j',
								src: '/resources/images/grippers/j.png',
								matrixColumn: 1
							}, {
								xtype: 'projectiongripper',
								id: 'projection-gripper-k',
								src: '/resources/images/grippers/k.png',
								matrixColumn: 2
							}]
						}]
					}],
					buttons: [{
						text: 'Create',
						handler: function () {
							this.up('form').submit();
						}
					}],
					success: function (response) {
						startDialog.close();
						Canvace.loadStage(response.projectId, response.stageId);
					}
				})
			}, {
				title: 'Load existing project',
				layout: 'fit',
				items: new CustomForm({
					url: '/',
					method: 'PUT',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					items: [{
						xtype: 'textfield',
						name: 'path',
						fieldLabel: 'Project path',
						width: 400,
						allowBlank: false
					}],
					buttons: [{
						text: 'Load',
						handler: function () {
							this.up('form').submit();
						}
					}],
					success: function (response) {
						startDialog.close();
						Canvace.loadStage(response.projectId, response.stageId);
					}
				})
			}, {
				title: 'Import project',
				layout: 'fit',
				items: new CustomForm({
					url: '/import',
					method: 'POST',
					layout: 'vbox',
					items: [{
						xtype: 'filefield',
						name: 'data',
						fieldLabel: 'JSON file',
						allowBlank: false
					}],
					buttons: [{
						text: 'Import',
						handler: function () {
							this.up('form').submit();
						}
					}],
					success: function (response) {
						startDialog.close();
						Canvace.loadStage(response.projectId, response.stageId);
					}
				})
			}]
		});
		startDialog.show();
		new Projection();
	};
}());
