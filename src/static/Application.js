Ext.application({
	name: 'Canvace Development Environment',
	launch: function () {
		Ext.create('Ext.container.Viewport', {
			layout: 'border',
			items: [{
				xtype: 'box',
				region: 'center',
				html: '<canvas id="canvas"></canvas>'
			}, {
				xtype: 'toolbar',
				region: 'west',
				layout: 'vbox',
				defaults: {
					scale: 'large',
					allowDepress: false
				},
				items: [{
					toggleGroup: 'tool',
					icon: 'resources/images/tools/drag.png',
					tooltip: 'Drag Tool',
					pressed: true
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/stamp.png',
					tooltip: 'Stamp Tools',
					menuAlign: 'tl-tr?',
					menu: [{
						text: 'Stamp Tile Tool',
						icon: 'resources/images/tools/stamp_tile.png'
					}, {
						text: 'Stamp Entity Tool',
						icon: 'resources/images/tools/stamp_entity.png'
					}]
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/fill.png',
					tooltip: 'Fill Tools',
					menuAlign: 'tl-tr?',
					menu: [{
						text: 'Fill Area Tool',
						icon: 'resources/images/tools/fill_area.png'
					}, {
						text: 'Fill Selection Command',
						icon: 'resources/images/tools/fill_selection.png'
					}]
				}, {
					toggleGroup: 'tool',
					icon: 'resources/images/tools/move_entity.png',
					tooltip: 'Move Entity Tool'
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/erase.png',
					tooltip: 'Erase Tools',
					menuAlign: 'tl-tr?',
					menu: [{
						text: 'Erase Tiles Tool',
						icon: 'resources/images/tools/erase_tiles.png'
					}, {
						text: 'Erase Entities Tool',
						icon: 'resources/images/tools/erase_entities.png'
					}, {
						text: 'Wipe Command',
						icon: 'resources/images/tools/wipe_tiles.png'
					}]
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/select.png',
					tooltip: 'Select Tools',
					menuAlign: 'tl-tr?',
					menu: [{
						text: 'Drag-Select Tool',
						icon: 'resources/images/tools/drag_select.png'
					}, {
						text: 'Flood-Select Tool',
						icon: 'resources/images/tools/flood_select.png'
					}]
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/clipboard.png',
					tooltip: 'Clipboard Tools',
					menuAlign: 'tl-tr?',
					menu: [{
						text: 'Cut Tiles Command',
						icon: 'resources/images/tools/cut_tiles.png'
					}, {
						text: 'Copy Tiles Command',
						icon: 'resources/images/tools/copy_tiles.png'
					}, {
						text: 'Paste Tiles Tool',
						icon: 'resources/images/tools/paste_tiles.png'
					}, {
						text: 'Cut Entities Tool',
						icon: 'resources/images/tools/cut_entities.png'
					}, {
						text: 'Copy Entities Tool',
						icon: 'resources/images/tools/copy_entities.png'
					}, {
						text: 'Paste Entities Tool',
						icon: 'resources/images/tools/paste_entity.png'
					}]
				}]
			}, {
				region: 'east'
			}, {
				region: 'south'
			}]
		});
	}
});
