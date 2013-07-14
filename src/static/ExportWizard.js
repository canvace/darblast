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
	var singleFile = false;
	var path = '';
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
				boxLabel: 'Single JSON file',
				listeners: {
					change: function (field, checked) {
						singleFile = checked;
					}
				}
			}, {
				inputValue: 'separate',
				boxLabel: 'Separate images',
				checked: true,
				listeners: {
					change: function (field, checked) {
						singleFile = !checked;
					}
				}
			}]
		}, {
			xtype: 'tabpanel',
			items: [(function () {
				return {
					title: 'Store to backend',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					buttons: [{
						text: 'Store',
						handler: function () {
							var waitMessage = Ext.MessageBox.wait('Exporting...', '', {
								interval: 170
							});
							Canvace.Ajax.get('/export', {
								single: singleFile,
								path: path
							}, function () {
								waitMessage.close();
							});
						}
					}],
					items: [{
						xtype: 'textfield',
						id: 'path-field',
						fieldLabel: 'Destination path'
					}, {
						xtype: 'directorytree',
						height: 200,
						listeners: {
							directoryselect: function (selectedPath) {
								path = selectedPath;
							}
						}
					}]
				};
			}()), {
				title: 'Download to frontend',
				buttons: [{
					text: 'Download',
					handler: function () {
						if (singleFile) {
							window.open('/export?single=true', 'Canvace - Export project');
						} else {
							window.open('/export', 'Canvace - Export project');
						}
					}
				}]
			}]
		}]
	})).show();
}
