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

function ImageControls() {
	var controls = new LowerControls('Images', 0, true, 'image', 'images');

	controls.onAddElement(function (selectedLabels) {
		var dialog = new Ext.window.Window({
			title: 'Load new images',
			modal: true,
			resizable: false,
			layout: 'fit',
			items: new CustomForm({
				url: 'images/',
				method: 'POST',
				layout: {
					type: 'vbox',
					flex: 'stretch'
				},
				items: [{
					xtype: 'filefield',
					name: 'images',
					buttonOnly: true,
					buttonText: 'Select image files...',
					allowBlank: false,
					listeners: {
						afterrender: function () {
							this.fileInputEl.dom.multiple = true;
						}
					}
				}, {
					xtype: 'combobox',
					name: 'labels',
					fieldLabel: 'Categories',
					multiSelect: true,
					width: 300,
					store: Canvace.images.getAllLabels(),
					value: selectedLabels
				}],
				buttons: [{
					text: 'Load',
					handler: function () {
						this.up('form').submit();
					}
				}, {
					text: 'Cancel',
					handler: function () {
						dialog.close();
					}
				}],
				success: function () {
					dialog.close();
				}
			})
		}).show();
	});

	controls.onLoadSheet(function () {
		if (window.canSplitImages) {
			// TODO
		} else {
			Ext.MessageBox.show({
				title: 'Additional software needed',
				msg: 'To import image sheets into Canvace you need to install Cairo and restart the environment.<br/>Do you want to open the Cairo website now? (Another browser window will open)',
				buttons: Ext.MessageBox.YESNO,
				icon: Ext.MessageBox.INFO,
				fn: function (button) {
					if (button === 'yes') {
						window.open('http://cairographics.org/');
					}
				}
			});
		}
	});

	controls.onActivateElement(function (id) {
		var image = Canvace.images.get(id);
		var dialog = new Ext.window.Window({
			title: 'Edit image',
			modal: true,
			resizable: false,
			layout: 'fit',
			items: new CustomForm({
				url: 'images/' + id,
				method: 'PUT',
				layout: {
					type: 'vbox',
					align: 'center'
				},
				items: [{
					xtype: 'image',
					src: 'images/' + id,
					width: 100,
					height: 100
				}, {
					xtype: 'combobox',
					name: 'labels',
					fieldLabel: 'Categories',
					width: 300,
					multiSelect: true,
					store: Canvace.images.getAllLabels(),
					value: image.getLabels()
				}],
				buttons: [{
					text: 'OK',
					handler: function () {
						this.up('form').submit();
					}
				}, {
					text: 'Cancel',
					handler: function () {
						dialog.close();
					}
				}],
				success: function () {
					dialog.close();
				}
			})
		}).show();
	});

	controls.onDeleteElement(function (ids) {
		ids.forEach(function (id) {
			Canvace.images.get(id)._delete();
		});
	});

	function addImage(image) {
		var id = image.getId();
		controls.addImage(id, image);
		image.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.images.forEach(addImage);
	Canvace.images.onCreate(addImage);
}
