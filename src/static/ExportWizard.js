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

function ExportWizard() {
	var dialog = (new Ext.window.Window({
		title: 'Export Wizard',
		resizable: false,
		width: 400,
		modal: true,
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		buttons: [{
			text: 'Close',
			handler: function () {
				dialog.close();
			}
		}],
		items: [{
			xtype: 'radiogroup',
			defaults: {
				name: 'format'
			},
			items: [{
				inputValue: 'single',
				boxLabel: 'Single JSON file'
			}, {
				inputValue: 'separate',
				boxLabel: 'Separate images',
				checked: true
			}]
		}, {
			xtype: 'grid',
			store: {
				autoSync: true,
				fields: [{
					name: 'selected',
					type: 'boolean'
				}, {
					name: 'name',
					type: 'string'
				}, 'stage'],
				data: (function (records) {
					Canvace.stages.forEach(function (stage) {
						records.push({
							selected: stage.isCurrent(),
							name: stage.getName(),
							stage: stage
						});
					});
					return records;
				}([])),
				sorters: [{
					property: 'name',
					direction: 'ASC'
				}]
			},
			header: false,
			hideHeaders: true,
			columns: [{
				xtype: 'checkcolumn',
				flex: 1,
				dataIndex: 'selected'
			}, {
				flex: 4,
				dataIndex: 'name'
			}]
		}, {
			layout: 'accordion',
			items: [{
				title: 'Store to backend',
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				buttons: [{
					text: 'Store',
					handler: function () {
						// TODO
					}
				}],
				items: [{
					xtype: 'textfield',
					fieldLabel: 'Destination path'
				}, {
					xtype: 'directorytree',
					height: 200,
					listeners: {
						directoryselect: function () {
							// TODO
						}
					}
				}]
			}, {
				title: 'Download to frontend',
				buttons: [{
					text: 'Download',
					handler: function () {
						// TODO submit form
					}
				}]
			}]
		}]
	})).show();
}
