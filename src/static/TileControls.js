function TileControls() {
	var controls = new LowerControls('Tiles', 1);

	controls.onAddElement = function () {
		var dialog = Ext.create('Ext.window.Window', {
			title: 'Create new tile',
			modal: true,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'form',
				layout: 'table',
				items: [{
					xtype: 'number',
					id: 'i-span-field',
					minValue: 1,
					value: 1
				}, {
					xtype: 'number',
					id: 'j-span-field',
					minValue: 1,
					value: 1
				}, {
					xtype: 'box'
					// TODO tile schema
				}]
			},
			buttons: [{
				text: 'OK',
				handler: function () {
					Canvace.tiles.create(/* ... */);
					dialog.close();
				}
			}, {
				text: 'Cancel',
				handler: function () {
					dialog.close();
				}
			}]
		}).show();
	};

	function addTile(tile) {
		var id = tile.getId();
		controls.addElement(id, tile.getLabels(), tile.getFirstFrameId());
		tile.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.tiles.forEach(addTile);
	Canvace.tiles.onCreate(addTile);

	this.hasSelection = controls.hasSelection;
	this.getSelectedId = controls.getSelectedId;
	this.getSelectedIds = controls.getSelectedIds;
}
