function ImageControls() {
	var controls = new LowerControls('Images');

	controls.onAddElement(function () {
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
	});

	controls.onLoadSheet(function () {
		// TODO
	});

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

	controls.onDeleteElement(function (ids) {
		Ext.MessageBox.show({
			title: 'Confirm deletion',
			msg: 'Do you actually want to delete the ' + ids.length + ' selected image(s)?',
			buttons: Ext.MessageBox.OKCANCEL,
			icon: Ext.MessageBox.WARNING,
			fn: function (button) {
				if (button === 'ok') {
					ids.forEach(function (id) {
						Canvace.images.get(id)._delete();
					});
				}
			}
		});
	});

	controls.onDeleteCategory(function () {
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
	});

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
