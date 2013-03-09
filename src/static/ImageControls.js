function ImageControls() {
	var view = Ext.create('Ext.view.View', {
		region: 'center',
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
		emptyText: 'No images',
		plugins: [
			Ext.create('Ext.ux.DataView.DragSelector', {})
		]
	});

	Ext.getCmp('lower-panel').add(Ext.create('Ext.container.Container', {
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
				tooltip: 'Delete selected images...'
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
		view.getStore().add({
			id: image.getId()
		});
	});

	Canvace.images.onCreate(function (id) {
		view.getStore().add({
			id: id
		});
	});
}
