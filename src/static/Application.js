(function () {
	Ext.Loader.setConfig({
		enabled: true,
		paths: {
			'Ext.ux': '/extjs/ux/'
		}
	});

	var width = screen.availWidth;
	var height = screen.availHeight;

	function initGUI() {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: [{
				layout: 'border',
				bbar: Ext.create('Ext.ux.statusbar.StatusBar', {}),
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
							icon: '/resources/images/tools/bug.png',
							tooltip: 'Report a bug...'
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
					collapsible: true,
					split: true,
					header: false,
					width: 250,
					title: 'Stages and Layer Controls',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					items: []
				}, {
					xtype: 'tabpanel',
					region: 'south',
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
							xtype: 'toolbar',
							region: 'north',
							items: [{
								tooltip: 'Load images...',
								handler: function () {
									var form = Ext.create('Ext.form.Panel', {
										url: 'images/',
										items: []
									});
									var dialog = Ext.create('Ext.window.Window', {
										title: 'Load new images',
										modal: true,
										resizable: false,
										draggable: false,
										layout: 'fit',
										bbar: {
											xtype: 'toolbar',
											layout: {
												pack: 'center'
											},
											items: [{
												text: 'OK',
												handler: function () {
													form.submit();
													dialog.close();
												}
											}, {
												text: 'Cancel',
												handler: function () {
													dialog.close();
												}
											}]
										},
										items: form
									}).show();
								}
							}, {
								tooltip: 'Load image sheet...'
							}, {
								tooltip: 'Delete selected images...'
							}, {
								tooltip: 'Delete selected category...'
							}]
						}, {
							xtype: 'treepanel',
							region: 'west',
							store: {
								root: {
									text: 'Categories',
									expanded: true
								}
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
			}]
		});

		Ext.get('canvas').set({
			width: width,
			height: height
		}).setStyle({
			backgroundColor: 'white'
		});
	}

	function loadStage() {
		history.pushState(null, 'Canvace Development Environment', '/stages/0/');
		Canvace.Ajax.get('../0', function (stage) {
			Canvace.poller = new Poller(function () {
				Canvace.view = new View(stage.matrix, stage.x0, stage.y0);
				Canvace.images = new Images(function () {
					Canvace.tiles = new Tiles(function () {
						Canvace.entities = new Entities(function () {
							Canvace.buckets = new Buckets(width, height);
							Canvace.tools = new Tools();
						});
					});
				});
			});
		});
	}

	Ext.application({
		name: 'Canvace Development Environment',
		launch: function () {
			initGUI();
			var startDialog = Ext.create('Ext.window.Window', {
				layout: 'vbox',
				title: 'Canvace Development Environment',
				modal: true,
				resizable: false,
				items: {
					layout: {
						type: 'hbox',
						pack: 'begin'
					},
					items: [{
						xtype: 'button',
						text: 'Start!',
						handler: function () {
							startDialog.close();
							loadStage();
						}
					}]
				}
			});
			startDialog.show();
		}
	});
}());
