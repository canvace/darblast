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
		Ext.define('Frame', {
			extend: 'Ext.data.Model',
			fields: [{
				name: 'src',
				type: 'string'
			}, {
				name: 'index',
				type: 'int'
			}]
		});

		Ext.create('Ext.data.Store', {
			id: 'frameStore',
			model: 'Frame',
			data: []
		});

		var tile = Canvace.tiles.get(id);
		var dialog = new Ext.window.Window({
			title: 'Tile configuration',
			modal: true,
			resizable: true,
			layout: 'fit',
			items: {
				xtype: 'tabpanel',
				layout: 'fit',
				items: [{
					title: 'General',
					layout: 'vbox',
					items: [{
						xtype: 'checkbox',
						fieldLabel: 'Solid',
						checked: tile.isSolid(),
						listeners: {
							change: function (field, checked) {
								tile.setSolid(checked);
							}
						}
					}, {
						xtype: 'checkbox',
						fieldLabel: 'Static',
						checked: tile.isStatic(),
						listeners: {
							change: function (field, checked) {
								tile.setStatic(checked);
							}
						}
					}]
				}, {
					title: 'Frames',
					layout: 'hbox',
					items: [{
						xtype: 'container',
						layout: 'vbox',
						items: [{
							xtype: 'dataview',
							cls: 'view',
							autoScroll: true,
							multiSelect: false,
							trackOver: true,
							overItemCls: 'x-item-over',
							maxWidth: 250,
							minHeight: 150,
							resizable: true,
							border: true,
							style: {
								borderColor: 'black',
								borderStyle: 'solid'
							},
							store: Ext.data.StoreManager.lookup('frameStore'),
							tpl: new Ext.XTemplate(
								'<tpl for=".">',
									'<div class="thumb-wrap">',
										'<div class="thumb">',
											'<img src="{src}" alt="{index}" />',
											'<br />',
											'<span>{index}</span>',
										'</div>',
									'</div>',
								'</tpl>',
								'<div class="x-clear"></div>'
							),
							itemSelector: 'div.thumb-wrap',
							emptyText: 'No frames available'
						}, {
							xtype: 'toolbar',
							items: [{
								text: 'Append frame',
								iconCls: 'x-add'
							}, {
								id: 'remove-frame',
								text: 'Remove selected',
								iconCls: 'x-delete',
								disabled: true
							}]
						}]
					}, {
						xtype: 'container',
						layout: 'vbox',
						items: [{
							xtype: 'box',
							id: 'frame-index',
							autoEl: {
								tag: 'div',
								html: 'Frame <b>#</b> out of <b>#</b>'
							}
						}, {
							xtype: 'numberfield',
							fieldLabel: 'Duration',
							minValue: 0,
							value: 100
						}, {
							xtype: 'checkbox',
							boxLabel: 'Loop animation',
							checked: false,
							listeners: {
								change: function () {
									// TODO
								}
							}
						}]
					}],
					listeners: {
						show: function () {
							Ext.get('frame-index').setHTML([
								'Frame <b>', (tile.hasFrames() ? 1 : 0), '</b> ',
								'out of <b>', tile.getFramesCount(), '</b>'
							].join(''));

							var store = Ext.data.StoreManager.lookup('frameStore');
							var index = 0;

							store.removeAll();

							tile.forEachFrame(function (frame) {
								store.add({
									src: '/images/' + frame.getImageId(),
									index: (index++)
								});
							});
						}
					}
				}, {
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
