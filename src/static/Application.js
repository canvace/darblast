Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext.ux': '/extjs/ux/'
	}
});

(function () {
	var width = screen.availWidth;
	var height = screen.availHeight;

	function initGUI() {
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
						}, {
							xtype: 'tbseparator'
						}, {
							icon: '/resources/images/tools/undo.png',
							tooltip: 'Undo',
							disabled: true
						}, {
							icon: '/resources/images/tools/redo.png',
							tooltip: 'Redo',
							disabled: true
						}, {
							xtype: 'tbseparator'
						}, {
							toggleGroup: 'tool',
							icon: '/resources/images/tools/drag.png',
							tooltip: 'Drag Tool',
							pressed: true
						}, new ToolGroup('/resources/images/tools/stamp.png', 'Stamp Tools', [{
							text: 'Stamp Tile Tool',
							icon: '/resources/images/tools/stamp_tile.png'
						}, {
							text: 'Stamp Entity Tool',
							icon: '/resources/images/tools/stamp_entity.png'
						}]), new ToolGroup('/resources/images/tools/fill.png', 'Fill Tools', [{
							text: 'Fill Area Tool',
							icon: '/resources/images/tools/fill_area.png'
						}, {
							text: 'Fill Selection Command',
							icon: '/resources/images/tools/fill_selection.png'
						}]), {
							toggleGroup: 'tool',
							icon: '/resources/images/tools/move_entity.png',
							tooltip: 'Move Entity Tool'
						}, new ToolGroup('/resources/images/tools/erase.png', 'Erase Tools', [{
							text: 'Erase Tiles Tool',
							icon: '/resources/images/tools/erase_tiles.png'
						}, {
							text: 'Erase Entities Tool',
							icon: '/resources/images/tools/erase_entities.png'
						}, {
							text: 'Wipe Command',
							icon: '/resources/images/tools/wipe_tiles.png'
						}]), new ToolGroup('/resources/images/tools/select.png', 'Select Tools', [{
							text: 'Drag-Select Tool',
							icon: '/resources/images/tools/drag_select.png'
						}, {
							text: 'Flood-Select Tool',
							icon: '/resources/images/tools/flood_select.png'
						}]), new ToolGroup('/resources/images/tools/clipboard.png', 'Clipboard Tools', [{
							text: 'Cut Tiles Command',
							icon: '/resources/images/tools/cut_tiles.png'
						}, {
							text: 'Copy Tiles Command',
							icon: '/resources/images/tools/copy_tiles.png'
						}, {
							text: 'Paste Tiles Tool',
							icon: '/resources/images/tools/paste_tiles.png'
						}, {
							text: 'Cut Entities Tool',
							icon: '/resources/images/tools/cut_entities.png'
						}, {
							text: 'Copy Entities Tool',
							icon: '/resources/images/tools/copy_entities.png'
						}, {
							text: 'Paste Entities Tool',
							icon: '/resources/images/tools/paste_entity.png'
						}])]
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
					region: 'south',
					weight: -2,
					collapsible: true,
					collapsed: true,
					split: true,
					title: 'Images and Elements',
					header: false,
					height: 200,
					items: [{
						title: 'Images',
						layout: 'border',
						items: [{
							xtype: 'treepanel',
							region: 'west',
							split: true,
							width: 250,
							tbar: [{
								icon: '/resources/images/icons/add.png',
								tooltip: 'Load images...',
								handler: function () {
									var dialog = Ext.create('Ext.window.Window', {
										title: 'Load new images',
										modal: true,
										resizable: false,
										draggable: false,
										layout: 'fit',
										items: new CustomForm({
											url: 'images/',
											method: 'POST',
											layout: {
												type: 'vbox',
												flex: 'stretch'
											},
											items: [{
												xtype: 'filefield',
												name: 'images',
												fieldLabel: 'Image file(s)',
												allowBlank: false
											}, {
												xtype: 'textfield',
												name: 'labels',
												fieldLabel: 'Categories',
												regex: /^\w*(\s*,\s*\w*)*$/,
												invalidText: 'Invalid category list: categories must include only alphanumeric characters and be separated by commas.'
											}],
											buttons: [{
												text: 'Load',
												handler: function () {
													this.up('form').submit();
												}
											}, {
												text: 'Cancel',
												handler: function () {
													dialog.close();
												}
											}],
											success: function () {
												dialog.close();
											}
										})
									}).show();
								}
							}, {
								icon: '/resources/images/icons/picture_add.png',
								tooltip: 'Load image sheet...'
							}, {
								icon: '/resources/images/icons/pencil.png',
								tooltip: 'Edit selected image...'
							}, {
								icon: '/resources/images/icons/folder_edit.png',
								tooltip: 'Edit selected category...'
							}, {
								icon: '/resources/images/icons/delete.png',
								tooltip: 'Delete selected images...'
							}, {
								icon: '/resources/images/icons/folder_delete.png',
								tooltip: 'Delete selected category...'
							}],
							root: {
								text: 'Categories',
								expanded: true
							}
						}, {
							region: 'center'
						}]
					}, {
						title: 'Tiles'
					}, {
						title: 'Entities'
					}]
				}]
			}
		});

		Ext.get('canvas').set({
			width: width,
			height: height
		}).setStyle({
			backgroundColor: 'white'
		});
	}

	function loadStage(projectId, id) {
		Canvace.poller = new Poller(projectId);
		var loader = new Loader(function () {
			var stage;
			try {
				stage = Canvace.stages.get(id);
			} catch (e) {
				Ext.MessageBox.alert('Error', 'The specified stage does not exist.');
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
				Canvace.renderer = new Renderer();
				Canvace.tools = new Tools();
				Canvace.renderer.render();
			});
		});
		loader.queue(function (callback) {
			Canvace.stages = new Stages(function () {
				new StageControls();
				callback();
			});
		});
		loader.queue(function (callback) {
			Canvace.images = new Images(function () {
				new ImageControls();
				callback();
			});
		});
		loader.queue(function (callback) {
			Canvace.tiles = new Tiles(callback);
		});
		loader.queue(function (callback) {
			Canvace.entities = new Entities(callback);
		});
		loader.allQueued();
	}

	Ext.application({
		name: 'Canvace Development Environment',
		launch: function () {
			initGUI();
			var startDialog = Ext.create('Ext.window.Window', {
				title: 'Canvace Development Environment',
				modal: true,
				closable: false,
				resizable: false,
				layout: 'accordion',
				items: [{
					title: 'Create new project',
					layout: 'fit',
					items: new CustomForm({
						xtype: 'form',
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
							items: []
						}],
						buttons: [{
							text: 'Create',
							handler: function () {
								this.up('form').submit();
							}
						}],
						success: function (response) {
							startDialog.close();
							loadStage(response.projectId, response.stageId);
						}
					})
				}, {
					title: 'Load existing project',
					layout: 'fit',
					items: new CustomForm({
						xtype: 'form',
						url: '/',
						method: 'PUT',
						layout: {
							type: 'vbox',
							align: 'stretch'
						},
						items: [{
							xtype: 'textfield',
							name: 'path',
							fieldLabel: 'ProjectPath',
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
							loadStage(response.projectId, response.stageId);
						}
					})
				}, {
					title: 'Import project',
					layout: 'fit',
					items: new CustomForm({})
				}]
			});
			startDialog.show();
		}
	});
}());
