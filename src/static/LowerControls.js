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
				autoSync: true,
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
				}, {
					name: 'unregisterUpdateHandler'
				}]
			},
			tpl: [
				'<tpl for=".">',
				'	<div class="thumb-wrap">',
				'		<tpl if="useImage">',
				'			<div class="thumb"><img src="images/{imageId}" alt=""></div>',
				'		<tpl else>',
				'			<div class="thumb"><img src="{[exports.generateBox(values.di, values.dj, 1).toDataURL()]}" alt=""/></div>',
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

		function getHierarchyRootConfig() {
			return (function walk(node) {
				var expandable = node.hasChildren();
				var children = [];
				node.forEachChild(function (childNode) {
					children.push(walk(childNode));
				});
				return {
					text: node.getName(),
					labels: node.getLabels(),
					allLabels: node.getAllLabels(),
					expandable: expandable,
					expanded: expandable,
					children: children
				};
			}(new (Canvace.images.getHierarchy()).Root('All')));
		}

		var editingPlugin = new Ext.grid.plugin.CellEditing({
			clicksToEdit: 2,
			listeners: {
				beforeedit: function (editor, event) {
					return !event.record.isRoot();
				},
				edit: function (editor, event) {
					var labels = event.record.get('labels');
					Canvace.images.forEach(function (image) {
						if (image.hasLabels(labels)) {
							var imageLabels = image.getLabels();
							var set = {};
							imageLabels.forEach(function (label) {
								set[label] = true;
							});
							labels.forEach(function (label) {
								delete set[label];
							});
							event.value.split(',').forEach(function (label) {
								set[label] = true;
							});
							var newLabels = [];
							for (var label in set) {
								newLabels.push(label);
							}
							image.setLabels(newLabels);
						}
					});
				}
			}
		});

		var hierarchyTree = new Ext.tree.Panel({
			region: 'west',
			split: true,
			autoScroll: true,
			width: 250,
			tbar: [{
				iconCls: 'x-add',
				tooltip: 'Load ' + elements + '...',
				handler: function () {
					handlers.fire('element/add', function (handler) {
						var records = hierarchyTree.getSelectionModel().getSelection();
						if (records.length) {
							handler(records[0].get('allLabels'));
						} else {
							handler([]);
						}
					});
				}
			}, {
				iconCls: 'x-add-picture',
				tooltip: 'Load many ' + elements + '...',
				handler: function () {
					handlers.fire('sheet/load', function (handler) {
						var records = hierarchyTree.getSelectionModel().getSelection();
						if (records.length) {
							handler(records[0].get('allLabels'));
						} else {
							handler([]);
						}
					});
				}
			}, {
				iconCls: 'x-edit',
				tooltip: 'Edit selected ' + element + '...',
				handler: function () {
					if (selection.hasSelection()) {
						handlers.fire('element/activate', function (handler) {
							handler(selection.getLastSelected().get('id'));
						});
					}
				}
			}, {
				iconCls: 'x-edit-folder',
				tooltip: 'Rename selected category...',
				handler: function () {
					var records = hierarchyTree.getSelectionModel().getSelection();
					if (records.length) {
						editingPlugin.startEdit(records[0], 0);
					}
				}
			}, {
				iconCls: 'x-delete',
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
									(function (ids) {
										handlers.fire('element/delete', function (handler) {
											handler(ids);
										});
									}(records.map(function (record) {
										return record.get('id');
									})));
								}
							}
						});
					}
				}
			}, {
				iconCls: 'x-delete-folder',
				tooltip: 'Delete selected category...',
				handler: function () {
					var records = hierarchyTree.getSelectionModel().getSelection();
					if (records.length) {
						var record = records[0];
						var labels = record.get('allLabels');
						var elementsToDelete = [];
						store.each(function (record) {
							var element = record.get('element');
							if (element.hasLabels(labels)) {
								elementsToDelete.push(element);
							}
						});
						if (elementsToDelete.length) {
							Ext.MessageBox.show({
								title: 'Confirm image removal',
								msg: 'Do you actually want to delete the ' + elementsToDelete.length + ' ' + elements + ' in the \"' + record.get('text') + '\" category?',
								icon: Ext.MessageBox.WARNING,
								buttons: Ext.MessageBox.OKCANCEL,
								modal: true,
								fn: function (button) {
									if (button === 'ok') {
										(function (elements) {
											handlers.fire('element/delete', function (handler) {
												handler(elements);
											});
										}(elementsToDelete.map(function (element) {
											return element.getId();
										})));
									}
								}
							});
						}
					}
				}
			}],
			fields: ['text', 'labels', 'allLabels'],
			columns: [{
				xtype: 'treecolumn',
				text: 'Categories',
				dataIndex: 'text',
				resizable: false,
				hideable: false,
				draggable: false,
				sortable: true,
				menuDisabled: true,
				editor: 'textfield'
			}],
			forceFit: true,
			root: getHierarchyRootConfig(),
			listeners: {
				selectionchange: function (selectionModel, records) {
					if (records.length) {
						var labels = records[0].get('allLabels');
						store.filterBy(function (record) {
							return record.get('element').hasLabels(labels);
						});
					} else {
						store.filterBy(function () {
							return true;
						});
					}
				}
			},
			plugins: [editingPlugin]
		});

		Canvace.images.onHierarchyChange(function () {
			hierarchyTree.setRootNode(getHierarchyRootConfig());
		});

		var lowerPanel = Ext.getCmp('lower-panel');
		lowerPanel.insert(index, {
			title: name,
			layout: 'border',
			items: [hierarchyTree, {
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
			var unregisterUpdateHandler = element.onUpdate(function (diff) {
				if (diff.firstFrameId) {
					if (element.hasFrames()) {
						records[id].set({
							useImage: true,
							imageId: element.getFirstFrameId()
						});
					} else {
						var layout = element.getLayout();
						records[id].set({
							useImage: false,
							di: layout.span.i,
							dj: layout.span.j
						});
					}
				}
			});
			if (element.hasFrames()) {
				records[id] = store.add({
					id: id,
					element: element,
					useImage: true,
					imageId: element.getFirstFrameId(),
					unregisterUpdateHandler: unregisterUpdateHandler
				})[0];
			} else {
				var layout = element.getLayout();
				records[id] = store.add({
					id: id,
					element: element,
					useImage: false,
					di: layout.span.i,
					dj: layout.span.j,
					unregisterUpdateHandler: unregisterUpdateHandler
				})[0];
			}
		};

		this.removeElement = function (id) {
			if (id in records) {
				var unregisterUpdateHandler = records[id].get('unregisterUpdateHandler');
				if (unregisterUpdateHandler) {
					unregisterUpdateHandler();
				}
				records[id].destroy();
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
