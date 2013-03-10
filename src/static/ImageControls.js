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
				tooltip: 'Edit selected image...'
			}, {
				icon: '/resources/images/icons/folder_edit.png',
				tooltip: 'Edit selected category...'
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete selected images...',
				handler: function () {
					var models = selection.getSelection();
					var imageConfig = [];
					if (models.length > 3) {
						// TODO
					} else {
						// TODO
					}
					var confirmationDialog = Ext.create('Ext.window.Window', {
						title: 'Confirm image deletion',
						modal: true,
						resizable: false,
						layout: 'vbox',
						items: [{
							xtype: 'header',
							title: 'Do you actually want to delete the ' + models.length + ' selected images?'
						}, {
							xtype: 'container',
							layout: 'hbox',
							items: imageConfig
						}],
						fbar: [{
							text: 'Delete',
							handler: function () {
								for (var i in models) {
									Canvace.images.get(models[i].get('id'))._delete();
								}
								confirmationDialog.close();
							}
						}, {
							text: 'Cancel',
							handler: function () {
								confirmationDialog.close();
							}
						}]
					});
					confirmationDialog.show();
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

	this.getSelectedId = function () {
		return selection.getLastSelected().get('id');
	};

	this.getSelectedIds = function () {
		var models = selection.getSelectedModels();
		var ids = [];
		for (var i in models) {
			ids.push(models[i].get('id'));
		}
		return ids;
	};
}
