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
		this.onSelectionChange = bindOn('selection/change');

		var view = new Ext.view.View({
			cls: 'view',
			autoScroll: true,
			store: {
				fields: [{
					name: 'id'
				}, {
					name: 'element'
				}, {
					name: 'useImage'
				}, {
					name: 'imageId'
				}, {
					name: 'di'
				}, {
					name: 'dj'
				}]
			},
			tpl: [
				'<tpl for=".">',
				'	<div class="thumb-wrap" id="{id}">',
				'		<tpl if="useImage">',
				'			<div class="thumb"><img src="images/{imageId}" alt=""></div>',
				'		<tpl else>',
				'			<div class="thumb" id="thumb-{id}"><img src="{[Canvace.view.generateBox(values.di, values.dj, 1).toDataURL()]}" alt=""/></div>',
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

		selection.on('selectionchange', function (view, selected) {
			var ids = selected.map(function (record) {
				return record.get('id');
			});
			handlers.fire('selection/change', function (handler) {
				handler(ids);
			});
		});

		var lowerPanel = Ext.getCmp('lower-panel');
		lowerPanel.insert(index, {
			title: name,
			layout: 'border',
			items: [{
				xtype: 'treepanel',
				region: 'west',
				split: true,
				autoScroll: true,
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
						if (selection.hasSelection()) {
							handlers.fire('element/activate', function (handler) {
								handler(selection.getLastSelected().get('id'));
							});
						}
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
						var records = selection.getSelection();
						if (records.length) {
							Ext.MessageBox.show({
								title: 'Confirm deletion',
								msg: 'Do you actually want to delete the ' + records.length + ' selected ' + elements + '?',
								buttons: Ext.MessageBox.OKCANCEL,
								icon: Ext.MessageBox.WARNING,
								fn: function (button) {
									if (button === 'ok') {
										handlers.fire('element/delete', function (handler) {
											handler(records.map(function (model) {
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
				root: (function walk(node) {
					var expandable = node.hasChildren();
					var children = [];
					node.forEachChild(function (childNode) {
						children.push(walk(childNode));
					});
					return {
						text: node.getName(),
						expandable: expandable,
						expanded: expandable,
						children: children
					};
				}(new Canvace.images.getHierarchy().Root('Categories'))),
				listeners: {
					selectionchange: function (selectionModel, records) {
						if (records.length && !records[0].isRoot()) {
							var label = records[0].get('text');
							store.filterBy(function (record) {
								return record.get('element').hasLabel(label);
							});
						} else {
							store.filterBy(function () {
								return true;
							});
						}
					}
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

		var records = {};

		this.addImage = function (id, image) {
			records[id] = store.add({
				id: id,
				element: image,
				useImage: true,
				imageId: image.getId()
			})[0];
		};
		this.addElement = function (id, element) {
			if (element.hasFrames()) {
				records[id] = store.add({
					id: id,
					element: element,
					useImage: true,
					imageId: element.getFirstFrameId()
				})[0];
			} else {
				var layout = element.getLayout();
				records[id] = store.add({
					id: id,
					element: element,
					useImage: false,
					di: layout.span.i,
					dj: layout.span.j
				})[0];
			}
		};

		this.removeElement = function (id) {
			if (id in records) {
				store.remove(records[id]);
				delete records[id];
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
