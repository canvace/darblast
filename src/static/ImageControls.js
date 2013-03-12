function ImageControls() {
	var controls = new LowerControls('Images');

	controls.onActivateElement(function (id) {
		var image = Canvace.images.get(id);
		var dialog = Ext.create('Ext.window.Window', {
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
					xtype: 'textfield',
					name: 'labels',
					fieldLabel: 'Categories',
					width: 300,
					regex: /^\w*(\s*,\s*\w*)*$/,
					invalidText: 'Invalid category list: categories must include only alphanumeric characters and be separated by commas.',
					value: image.getLabels().join(', ')
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

/*
	Ext.getCmp('lower-panel').add(Ext.create('Ext.panel.Panel', {
		title: 'Images',
		layout: 'border',
		items: [{
			xtype: 'treepanel',
			region: 'west',
			split: true,
			width: 250,
			tbar: [{
				icon: '/resources/images/icons/add.png',
				tooltip: 'Load images...',
				handler: function () {
					var dialog = Ext.create('Ext.window.Window', {
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
								fieldLabel: 'Image file(s)',
								allowBlank: false
							}, {
								xtype: 'textfield',
								name: 'labels',
								fieldLabel: 'Categories',
								regex: /^\w*(\s*,\s*\w*)*$/,
								invalidText: 'Invalid category list: categories must include only alphanumeric characters and be separated by commas.'
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
				}
			}, {
				icon: '/resources/images/icons/picture_add.png',
				tooltip: 'Load image sheet...',
				handler: function () {
					if (window.canSplitImages) {
						// TODO
					} else {
						Ext.MessageBox.show({
							title: 'Additional software needed',
							msg: 'To import image sheets into Canvace you need to install Cairo and restart the environment.<br/>Do you want to open the Cairo website now? (Another window will open)',
							buttons: Ext.MessageBox.YESNO,
							icon: Ext.MessageBox.INFORMATION,
							fn: function (button) {
								if (button === 'yes') {
									window.open('http://cairographics.org/');
								}
							}
						});
					}
				}
			}, {
				icon: '/resources/images/icons/pencil.png',
				tooltip: 'Edit selected image...',
				handler: function () {
					var model = selection.getLastSelected();
					if (model) {
						edit(model);
					}
				}
			}, {
				icon: '/resources/images/icons/folder_edit.png',
				tooltip: 'Rename selected category...'
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete selected images...',
				handler: function () {
					var models = selection.getSelection();
					if (models.length) {
						Ext.MessageBox.show({
							title: 'Confirm deletion',
							msg: 'Do you actually want to delete the ' + models.length + ' selected image(s)?',
							buttons: Ext.MessageBox.OKCANCEL,
							icon: Ext.MessageBox.WARNING,
							fn: function (button) {
								if (button === 'ok') {
									models.forEach(function (model) {
										Canvace.images.get(model.get('id'))._delete();
									});
								}
							}
						});
					}
				}
			}, {
				icon: '/resources/images/icons/folder_delete.png',
				tooltip: 'Delete selected category...',
				handler: function () {
					Ext.MessageBox({
						title: 'Confirm category removal',
						msg: 'Do you actually want to delete the selected category and all the images it contains?',
						buttons: Ext.MessageBox.OKCANCEL,
						icon: Ext.MessageBox.WARNING,
						fn: function (button) {
							if (button === 'ok') {
								// TODO
							}
						}
					});
				}
			}],
			root: {
				text: 'Categories',
				expanded: true
			}
		}, view]
	}));
*/

	function addImage(image) {
		var id = image.getId();
		controls.addElement(id, image.getLabels(), id);
		image.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.images.forEach(addImage);
	Canvace.images.onCreate(addImage);
}
