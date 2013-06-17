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

function LayerControls() {
	var store;
	var grid = new Ext.grid.Panel({
		header: false,
		hideHeaders: true,
		store: {
			autoSync: true,
			fields: [{
				name: 'index',
				type: 'int'
			}, {
				name: 'text',
				type: 'string'
			}, {
				name: 'enabled',
				type: 'boolean'
			}],
			sorters: [{
				property: 'index',
				direction: 'DESC'
			}]
		},
		columns: [{
			xtype: 'checkcolumn',
			flex: 1,
			dataIndex: 'enabled',
			draggable: false,
			hideable: false,
			sortable: false,
			listeners: {
				checkchange: function (column, rowIndex, checked) {
					Canvace.layers.toggle(store.getAt(rowIndex).get('index'), checked);
					Canvace.renderer.render();
				}
			}
		}, {
			flex: 4,
			dataIndex: 'text',
			draggable: false,
			hideable: false,
			sortable: false
		}, {
			xtype: 'actioncolumn',
			flex: 1,
			draggable: false,
			hideable: false,
			iconCls: 'x-delete',
			tooltip: 'Erase layer',
			handler: function (view, rowIndex, colIndex, item, event, record) {
				if (Canvace.layers.erase(record.get('index'))) {
					record.destroy();
				}
				Canvace.renderer.render();
			}
		}],
		forceFit: true,
		tbar: [{
			icon: '/resources/images/icons/page_white_get.png',
			tooltip: 'Add layer atop',
			handler: function () {
				Canvace.layers.addAbove(function (index) {
					store.add({
						index: index,
						text: 'Layer ' + index,
						enabled: true
					});
				});
				Canvace.renderer.render();
			}
		}, {
			icon: '/resources/images/icons/page_white_put.png',
			tooltip: 'Add layer beneath',
			handler: function () {
				Canvace.layers.addBelow(function (index) {
					store.add({
						index: index,
						text: 'Layer ' + index,
						enabled: true
					});
				});
				Canvace.renderer.render();
			}
		}, {
			icon: '/resources/images/icons/layers.png',
			tooltip: 'Toggle layer transparency',
			enableToggle: true,
			pressed: true,
			listeners: {
				toggle: function (button, pressed) {
					Canvace.renderer.toggleTransparency(pressed);
				}
			}
		}, {
			icon: '/resources/images/icons/grid_toggle.png',
			tooltip: 'Toggle grid',
			enableToggle: true,
			pressed: true,
			listeners: {
				toggle: function (button, pressed) {
					Canvace.renderer.toggleGrid(pressed);
				}
			}
		}],
		listeners: {
			selectionchange: function (selectionModel, selected) {
				if (selected.length) {
					Canvace.layers.select(selected[0].get('index'));
					Canvace.renderer.render();
				}
			}
		}
	});

	store = grid.getStore();
	Canvace.layers.forEach(function (index) {
		store.add({
			index: index,
			text: 'Layer ' + index,
			enabled: Canvace.layers.isOn(index)
		});
	});

	Ext.getCmp('layer-controls').add(grid);
}
