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
					icon: 'resources/images/tools/drag.png'
				}, {
					xtype: 'splitbutton',
					icon: 'resources/images/tools/stamp.png',
					menu: [{
						icon: 'resources/images/tools/stamp_tiles.png'
					}, {
						icon: 'resources/images/tools/stamp_entities.png'
					}]
				}, {
					xtype: 'splitbutton',
					icon: 'resources/images/tools/fill.png'
				}, {
					icon: 'resources/images/tools/move_entity.png'
				}, {
					xtype: 'splitbutton',
					icon: 'resources/images/tools/erase.png'
				}, {
					xtype: 'splitbutton',
					icon: 'resources/images/tools/select.png'
				}, {
					xtype: 'splitbutton',
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
