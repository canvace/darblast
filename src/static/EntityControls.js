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

function EntityControls() {
	var controls = new LowerControls('Entities', 2, false, 'entity', 'entities');

	controls.onAddElement(function () {
		Canvace.entities.create();
	});

	controls.onLoadSheet(function () {
		var imageIds = [];
		var offset = {
			x: 0,
			y: 0
		};
		var dialog = (new Ext.window.Window({
			title: 'Create many entities',
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
						Canvace.entities.create(imageId, offset);
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
		var entity = Canvace.entities.get(id);
		var dialog = new Ext.window.Window({
			title: 'Entity configuration',
			modal: true,
			resizable: true,
			width: 600,
			height: 350,
			layout: 'fit',
			items: [{
				xtype: 'tabpanel',
				layout: 'fit',
				items: [new FrameControls(entity), new PositioningControls(entity), {
					title: 'Physics',
					layout: 'vbox',
					items: {
						xtype: 'checkboxwithtooltip',
						boxLabel: 'Enable physics',
						checked: entity.hasPhysics(),
						tooltip: 'Enables default AABB physics',
						listeners: {
							change: function (field, checked) {
								entity.setPhysics(checked);
							}
						}
					}
				}, {
					id: 'entity-properties-tab',
					title: 'Properties',
					layout: 'fit'
				}]
			}],
			buttons: [{
				text: 'Close',
				handler: function () {
					dialog.close();
				}
			}]
		});
		new PropertyControls(Ext.getCmp('entity-properties-tab')).bind(entity, 'Entity ' + id);
		dialog.show();
	});

	controls.onDeleteElement(function (ids, force) {
		ids.forEach(function (id) {
			Canvace.entities.get(id)._delete(force);
		});
	});

	function addEntity(entity) {
		var id = entity.getId();
		controls.addElement(id, entity);
		entity.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.entities.forEach(addEntity);
	Canvace.entities.onCreate(addEntity);

	this.hasSelection = controls.hasSelection;
	this.getSelectedId = controls.getSelectedId;
	this.getSelectedIds = controls.getSelectedIds;
	this.onSelectionChange = controls.onSelectionChange;
}
