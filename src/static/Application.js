(function () {
	var width = screen.availWidth;
	var height = screen.availHeight;

	function initGUI() {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: [{
				layout: 'border',
				/*
				bbar: {
					xtype: 'statusbar'
				},
				*/
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
						title: 'Stage'
					}, {
						title: 'Images',
						layout: 'border',
						items: [{
							xtype: 'toolbar',
							region: 'north',
							items: [{
								tooltip: 'Load images...'
							}, {
								tooltip: 'Load image sheet...'
							}, {
								tooltip: 'Delete selected images...'
							}, {
								tooltip: 'Delete selected label...'
							}]
						}, {
							xtype: 'treepanel',
							region: 'west',
							store: {
								root: {
									text: 'Labels',
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
		history.pushState(null, 'Canvace Development Environment', '/stage/0/');
		Canvace.Ajax.get('../0', function (data) {
			var images = new Images();
			var view = new View(data.matrix, data.x0, data.y0);
			var buckets = new Buckets(width, height);
			var tools = new Tools();
			(function () {}(images, view, buckets, tools)); // XXX turn off grunt's unused variable warning temporarily
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
