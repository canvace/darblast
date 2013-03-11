function ImageControls() {
	var view = Ext.create('Ext.view.View', {
		id: 'images-view',
		region: 'center',
		store: [],
		tpl: [
			'<tpl for=".">',
			'	<div class="thumb-wrap" id="{id}">',
			'		<div class="thumb"><img src="images/{id}"></div>',
			'	</div>',
			'</tpl>',
			'<div class="x-clear"></div>'
		],
		multiSelect: true,
		trackOver: true,
		overItemCls: 'x-item-over',
		itemSelector: 'div.thumb-wrap',
		emptyText: 'No images',
		plugins: [
			Ext.create('Ext.ux.DataView.DragSelector', {})
		]
	});
	var store = view.getStore();
	var selection = view.getSelectionModel();

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
						draggable: false,
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
				tooltip: 'Load image sheet...'
			}, {
				icon: '/resources/images/icons/pencil.png',
				tooltip: 'Edit selected image...',
				handler: function () {
					var model = selection.getLastSelected();
					if (model) {
						var id = model.get('id');
						var image = Canvace.images.get(id);
						var dialog = Ext.create('Ext.window.Window', {
							title: 'Edit image',
							modal: true,
							resizable: false,
							layout: 'vbox',
							items: [{
								xtype: 'image',
								src: 'images/' + id,
								shrinkWrap: false
							}, {
								xtype: 'textfield',
								id: 'image-labels',
								value: image.getLabels().join(', '),
								fieldlabel: 'Labels'
							}],
							fbar: [{
								text: 'OK',
								handler: function () {
									Canvace.images.get(id).setLabels(Ext.getCmp('image-labels').getValue());
									dialog.close();
								}
							}, {
								text: 'Cancel',
								handler: function () {
									dialog.close();
								}
							}]
						});
						dialog.show();
					}
				}
			}, {
				icon: '/resources/images/icons/folder_edit.png',
				tooltip: 'Edit selected category...'
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
				tooltip: 'Delete selected category...'
			}],
			root: {
				text: 'Categories',
				expanded: true
			}
		}, view]
	}));

	Canvace.images.forEach(function (image) {
		var model = store.add({
			id: image.getId()
		});
		image.onDelete(function () {
			store.remove(model);
		});
	});

	Canvace.images.onCreate(function (id) {
		var model = store.add({
			id: id
		});
		Canvace.images.get(id).onDelete(function () {
			store.remove(model);
		});
	});

	this.hasSelection = function () {
		return selection.hasSelection();
	};

	this.getSelectedId = function () {
		if (selection.hasSelection()) {
			return selection.getLastSelected().get('id');
		}
	};

	this.getSelectedIds = function () {
		return selection.getSelection().map(function (model) {
			return model.get('id');
		});
	};
}
