function TileControls() {
	var controls = new LowerControls('Tiles', 1, false, 'tile', 'tiles');

	controls.onAddElement(function () {
		var dialog = new Ext.window.Window({
			title: 'Create new tile',
			modal: true,
			resizable: false,
			layout: 'fit',
			items: {
				layout: 'vbox',
				items: [{
					xtype: 'numberfield',
					id: 'i-span-field',
					fieldLabel: 'I span',
					minValue: 1,
					value: 1
				}, {
					xtype: 'numberfield',
					id: 'j-span-field',
					fieldLabel: 'J span',
					minValue: 1,
					value: 1
				}, {
					xtype: 'box'
				}]
			},
			buttons: [{
				text: 'OK',
				handler: function () {
					Canvace.tiles.create(
						Ext.getCmp('i-span-field').getValue(),
						Ext.getCmp('j-span-field').getValue(),
						0,
						0
						);
					dialog.close();
				}
			}, {
				text: 'Cancel',
				handler: function () {
					dialog.close();
				}
			}]
		}).show();
	});

	controls.onActivateElement(function (id) {
		var tile = Canvace.tiles.get(id);
		var dialog = new Ext.window.Window({
			title: 'Tile configuration',
			modal: true,
			resizable: true,
			width: 400,
			height: 300,
			layout: 'fit',
			items: {
				xtype: 'tabpanel',
				layout: 'fit',
				items: [{
					title: 'General',
					layout: 'vbox',
					items: [{
						xtype: 'checkboxwithtooltip',
						boxLabel: 'Solid',
						checked: tile.isSolid(),
						tooltip: 'Indicates whether entities with physics enabled collide with this tile',
						listeners: {
							change: function (field, checked) {
								tile.setSolid(checked);
							}
						}
					}, {
						xtype: 'checkboxwithtooltip',
						boxLabel: 'Static',
						checked: tile.isStatic(),
						tooltip: 'Indicates that this tile never changes in the map during the game',
						listeners: {
							change: function (field, checked) {
								tile.setStatic(checked);
							}
						}
					}]
				}, new FrameControls(tile), {
					title: 'Positioning',
					layout: 'hbox',
					items: [{
						xtype: 'box',
						rowspan: 2,
						resizable: true,
						width: 200,
						height: 200
					}, {
						xtype: 'container',
						layout: 'vbox',
						items: [{
							xtype: 'checkbox',
							boxLabel: 'Transparency',
							checked: false,
							listeners: {
								change: function () {
									// TODO
								}
							}
						}, {
							xtype: 'checkbox',
							boxLabel: 'Animate',
							checked: true,
							listeners: {
								change: function () {
									// TODO
								}
							}
						}, {
							xtype: 'textfield',
							fieldLabel: 'X offset',
							labelAlign: 'top',
							value: tile.getOffset().x,
							listeners: {
								blur: function (field) {
									tile.setOffsetX(parseFloat(field.getValue()));
								}
							}
						}, {
							xtype: 'textfield',
							fieldLabel: 'Y offset',
							labelAlign: 'top',
							value: tile.getOffset().y,
							listeners: {
								blur: function (field) {
									tile.setOffsetY(parseFloat(field.getValue()));
								}
							}
						}]
					}]
				}, {
					id: 'tile-properties-tab',
					title: 'Properties',
					layout: 'fit'
				}]
			},
			buttons: [{
				text: 'OK',
				handler: function () {
					dialog.close();
				}
			}]
		});
		new PropertyControls(Ext.getCmp('tile-properties-tab')).bind(tile, 'Tile ' + id);
		dialog.show();
	});

	controls.onDeleteElement(function (ids) {
		ids.forEach(function (id) {
			Canvace.tiles.get(id)._delete();
		});
	});

	function addTile(tile) {
		var id = tile.getId();
		controls.addElement(id, tile);
		tile.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.tiles.forEach(addTile);
	Canvace.tiles.onCreate(addTile);

	this.hasSelection = controls.hasSelection;
	this.getSelectedId = controls.getSelectedId;
	this.getSelectedIds = controls.getSelectedIds;
	this.onSelectionChange = controls.onSelectionChange;
}
