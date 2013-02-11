Ext.application({
	name: 'Canvace Development Environment',
	launch: function () {
		Ext.create('Ext.container.Viewport', {
			layout: 'border',
			items: [{
				region: 'center'
			}, {
				xtype: 'toolbar',
				region: 'west',
				layout: 'vbox',
				defaults: {
					scale: 'large'
				},
				items: [{
					toggleGroup: 'tool',
					icon: 'resources/images/tools/drag.png',
					pressed: true
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/stamp.png',
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
					icon: 'resources/images/tools/fill.png'
				}, {
					toggleGroup: 'tool',
					icon: 'resources/images/tools/move_entity.png'
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/erase.png'
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/select.png'
				}, {
					xtype: 'splitbutton',
					toggleGroup: 'tool',
					icon: 'resources/images/tools/clipboard.png'
				}]
			}, {
				region: 'east'
			}, {
				region: 'south'
			}]
		});
	}
});
