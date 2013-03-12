function LowerControls(name) {
	var handlers = new EventHandlers();

	function bindOn(key) {
		return function (handler) {
			return handlers.registerHandler(key, handler);
		};
	}

	this.onAddElement = bindOn('element/add');
	this.onActivateElement = bindOn('element/activate');
	this.onDeleteElement = bindOn('element/delete');
	this.onLoadSheet = bindOn('sheet/load');
	this.onDeleteCategory = bindOn('category/delete');

	var view = Ext.create('Ext.view.View', {
		store: [],
		tpl: [
			'<tpl for=".">',
			'	<div class="thumb-wrap" id="{id}">',
			'		<div class="thumb"><img src="images/{imageId}"></div>',
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
		],
		listeners: {
			itemdblclick: function (view, model) {
				handlers.fire('element/activate', function (handler) {
					handler(model.get('id'));
				});
			}
		}
	});
	var store = view.getStore();
	var selection = view.getSelectionModel();

	Ext.getCmp('lower-panel').add({
		title: name,
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
					handlers.fire('element/add');
				}
			}, {
				icon: '/resources/images/icons/picture_add.png',
				tooltip: 'Load image sheet...',
				handler: function () {
					if (window.canSplitImages) {
						handlers.fire('sheet/load');
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
					handlers.fire('element/activate');
				}
			}, {
				icon: '/resources/images/icons/folder_edit.png',
				tooltip: 'Rename selected category...',
				handler: function () {
					// TODO
				}
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete selected images...',
				handler: function () {
					var models = selection.getSelection();
					if (models.length) {
						handlers.fire('element/delete', function (handler) {
							handler(models.map(function (model) {
								return model.get('id');
							}));
						});
					}
				}
			}, {
				icon: '/resources/images/icons/folder_delete.png',
				tooltip: 'Delete selected category...',
				handler: function () {
					// TODO
				}
			}],
			root: {
				text: 'Categories',
				expanded: true
			}
		}, {
			region: 'center',
			layout: 'fit',
			items: view
		}]
	});

	var models = {};

	this.addElement = function (id, labels, imageId) {
		models[id] = store.add({
			id: id,
			labels: labels,
			imageId: imageId
		});
	};

	this.removeElement = function (id) {
		if (id in models) {
			store.remove(models[id]);
			delete models[id];
		}
	};

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
