/*
 *	Canvace Visual Development Environment, codenamed "Darblast".
 *	Copyright (C) 2013  Canvace Srl  <http://www.canvace.com/>
 *
 *	Dual licensed under the MIT and GPLv3 licenses.
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function TileControls() {
	var controls = new LowerControls('Tiles', 1, false, 'tile', 'tiles');

	controls.onAddElement(function () {
		var dialog = (new Ext.window.Window({
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
					xtype: 'tileschema'
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
		})).show();
	});

	controls.onLoadSheet(function () {
		var imageIds = [];
		var offset = {
			x: 0,
			y: 0
		};
		var dialog = (new Ext.window.Window({
			title: 'Create many tiles',
			modal: true,
			resizable: false,
			layout: 'vbox',
			items: [{
				xtype: 'button',
				text: 'Select images...',
				handler: function () {
					new ImageSelector(true, function (selectedImageIds) {
						imageIds = selectedImageIds;
					});
				}
			}, {
				xtype: 'numberfield',
				fieldLabel: 'Offset X',
				value: 0,
				listeners: {
					change: function (field, value) {
						offset.x = value;
					}
				}
			}, {
				xtype: 'numberfield',
				fieldLabel: 'Offset Y',
				value: 0,
				listeners: {
					change: function (field, value) {
						offset.y = value;
					}
				}
			}],
			buttons: [{
				text: 'OK',
				handler: function () {
					dialog.close();
					imageIds.forEach(function (imageId) {
						Canvace.tiles.create(1, 1, 0, 0, imageId, offset);
					});
				}
			}, {
				text: 'Cancel',
				handler: function () {
					dialog.close();
				}
			}]
		})).show();
	});

	controls.onActivateElement(function (id) {
		var tile = Canvace.tiles.get(id);
		var dialog = new Ext.window.Window({
			title: 'Tile configuration',
			modal: true,
			resizable: true,
			width: 600,
			height: 350,
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
				}, new FrameControls(tile), new PositioningControls(tile), {
					id: 'tile-properties-tab',
					title: 'Properties',
					layout: 'fit'
				}]
			},
			buttons: [{
				text: 'Close',
				handler: function () {
					dialog.close();
				}
			}]
		});
		new PropertyControls(Ext.getCmp('tile-properties-tab')).bind(tile, 'Tile ' + id);
		dialog.show();
	});

	controls.onDeleteElement(function (ids, force) {
		ids.forEach(function (id) {
			Canvace.tiles.get(id)._delete(force);
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
