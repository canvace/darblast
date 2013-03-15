var LowerControls = (function () {
	var tabs = {};
	var maxIndex = -1;

	return function (name, index, activate, element, elements) {
		var handlers = new EventHandlers();

		function bindOn(key) {
			return function (handler) {
				return handlers.registerHandler(key, handler);
			};
		}

		this.onAddElement = bindOn('element/add');
		this.onLoadSheet = bindOn('sheet/load');
		this.onActivateElement = bindOn('element/activate');
		this.onDeleteElement = bindOn('element/delete');

		var view = Ext.create('Ext.view.View', {
			cls: 'view',
			store: {
				fields: [{
					name: 'id'
				}, {
					name: 'labels'
				}, {
					name: 'imageId'
				}]
			},
			tpl: [
				'<tpl for=".">',
				'	<div class="thumb-wrap" id="{id}">',
				'		<tpl if="imageId !== false">',
				'			<div class="thumb"><img src="images/{imageId}" alt=""></div>',
				'		<tpl else>',
				'			<div class="thumb" id="thumb-{id}"><img src="{[Canvace.view.generateBox(1, 1, 1, {',
				'				asDataURL: true',
				'			})]}" alt=""/></div>',
				'		</tpl>',
				'	</div>',
				'</tpl>',
				'<div class="x-clear"></div>'
			],
			multiSelect: true,
			trackOver: true,
			overItemCls: 'x-item-over',
			itemSelector: 'div.thumb-wrap',
			emptyText: 'No items',
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

		(function () {
			/*
			 * This is to order tabs correctly independently of when they are
			 * added to the panel.
			 */
			tabs[index] = true;
			maxIndex = Math.max(maxIndex, index);
			for (var i = 0, j = 0; i <= maxIndex; i++) {
				if (tabs[i]) {
					if (i == index) {
						index = j;
					} else {
						j++;
					}
				}
			}
		}());

		var lowerPanel = Ext.getCmp('lower-panel');
		lowerPanel.insert(index, {
			title: name,
			layout: 'border',
			items: [{
				xtype: 'treepanel',
				region: 'west',
				split: true,
				width: 250,
				tbar: [{
					icon: '/resources/images/icons/add.png',
					tooltip: 'Load ' + elements + '...',
					handler: function () {
						handlers.fire('element/add');
					}
				}, {
					icon: '/resources/images/icons/picture_add.png',
					tooltip: 'Load ' + element + ' sheet...',
					handler: function () {
						if (window.canSplitImages) {
							handlers.fire('sheet/load');
						} else {
							Ext.MessageBox.show({
								title: 'Additional software needed',
								msg: 'To import image sheets into Canvace you need to install Cairo and restart the environment.<br/>Do you want to open the Cairo website now? (Another browser window will open)',
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
					tooltip: 'Edit selected ' + element + '...',
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
					tooltip: 'Delete selected ' + elements + '...',
					handler: function () {
						var models = selection.getSelection();
						if (models.length) {
							Ext.MessageBox.show({
								title: 'Confirm deletion',
								msg: 'Do you actually want to delete the ' + models.length + ' selected ' + elements + '?',
								buttons: Ext.MessageBox.OKCANCEL,
								icon: Ext.MessageBox.WARNING,
								fn: function (button) {
									if (button === 'ok') {
										handlers.fire('element/delete', function (handler) {
											handler(models.map(function (model) {
												return model.get('id');
											}));
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
		if (activate) {
			lowerPanel.setActiveTab(index);
		}

		var models = {};

		this.addElement = function (id, labels, imageId) {
			models[id] = store.add({
				id: id,
				labels: labels,
				imageId: imageId
			})[0];
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
	};
}());
