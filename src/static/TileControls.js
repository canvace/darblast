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
					// TODO Canvace.tiles.create(...);
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

	controls.onActivateElement(function (id) {
		var tile = Canvace.tiles.get(id);
		var dialog = Ext.create('Ext.window.Window', {
			title: 'Tile configuration',
			modal: true,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'tabpanel',
				items: [{
					xtype: 'form',
					title: 'General',
					items: [{
						xtype: 'checkbox',
						fieldLabel: 'Solid',
						checked: tile.isSolid()
					}, {
						xtype: 'checkbox',
						fieldLabel: 'Static',
						checked: tile.isStatic()
					}]
				}, {
					title: 'Frames'
				}, {
					title: 'Positioning'
				}, {
					title: 'Properties'
				}]
			},
			buttons: [{
				text: 'OK',
				handler: function () {
					dialog.close();
				}
			}]
		}).show();
	});

	controls.onDeleteElement(function (ids) {
		Ext.MessageBox.show({
			title: 'Confirm tile deletion',
			msg: 'Do you actually want to delete the ' + ids.length + ' selected tiles?',
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.WARNING,
			fn: function (button) {
				if (button === 'yes') {
					ids.forEach(function (id) {
						Canvace.tiles.get(id)._delete();
					});
				}
			}
		});
	});

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
