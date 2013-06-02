function StageControls() {
	var container = Ext.getCmp('stage-controls');

	var propertyGrid = new PropertyControls(container, {
		region: 'south',
		split: true,
		collapsible: true,
		title: 'Properties',
		height: 300
	});

	var editingPlugin = new Ext.grid.plugin.CellEditing({
		clicksToEdit: 2,
		listeners: {
			beforeedit: function (editor, event) {
				if (!!event.rowIdx) {
					var record = event.record;
					var stage = Canvace.stages.get(record.get('id'));
					record.set('text', stage.getId());
					record.commit();
				} else {
					return false;
				}
			},
			edit: function (editor, event) {
				var record = event.record;
				var id = record.get('id');
				var text = record.get('text');
				if (text != id) {
					Canvace.stages.get(event.record.get('id')).rename(event.record.get('text'));
				} else {
					var stage = Canvace.stages.get(id);
					if (stage.isCurrent()) {
						record.set('text', stage.getId() + ' (current stage)');
					}
					record.commit();
				}
			},
			canceledit: function (editor, event) {
				var record = event.record;
				var stage = Canvace.stages.get(record.get('id'));
				if (stage.isCurrent()) {
					record.set('text', stage.getId() + ' (current stage)');
				}
				record.commit();
			}
		}
	});

	var tree = new Ext.tree.Panel({
		region: 'center',
		autoScroll: true,
		tbar: {
			xtype: 'toolbar',
			items: [{
				icon: '/resources/images/icons/add.png',
				tooltip: 'New stage...',
				handler: function () {
					Ext.MessageBox.prompt('Create new stage', 'Enter a new stage name:', function (button, text) {
						if (button === 'ok') {
							Canvace.stages.create(text);
						}
					});
				}
			}, {
				icon: '/resources/images/icons/application_get.png',
				tooltip: 'Load stage',
				handler: function () {
					var selectedNodes = tree.getSelectionModel().getSelection();
					if (selectedNodes.length && !selectedNodes[0].isRoot()) {
						window.location = '/?stage=' + encodeURIComponent(selectedNodes[0].get('id'));
					}
				}
			}, {
				icon: '/resources/images/icons/pencil.png',
				tooltip: 'Rename stage',
				handler: function () {
					var selectedNodes = tree.getSelectionModel().getSelection();
					if (selectedNodes.length && !selectedNodes[0].isRoot()) {
						editingPlugin.startEdit(selectedNodes[0], 0);
					}
				}
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete stage...',
				handler: function () {
					var selectedNodes = tree.getSelectionModel().getSelection();
					if (selectedNodes.length && !selectedNodes[0].isRoot()) {
						Ext.MessageBox.show({
							title: 'Confirm stage deletion',
							msg: 'Do you actually want to permanently delete the stages ' + (function (names) {
								var lastName = names.pop();
								if (names.length) {
									return names.join(', ') + ' and ' + lastName;
								} else {
									return lastName;
								}
							}(selectedNodes.map(function (node) {
								return '"' + node.get('id') + '"';
							}))) + ' and all of their associated data?',
							buttons: Ext.MessageBox.OKCANCEL,
							icon: Ext.MessageBox.WARNING,
							fn: function (button) {
								if (button === 'ok') {
									selectedNodes.forEach(function (stageEntry) {
										Canvace.stages.get(stageEntry.get('id'))._delete();
									});
								}
							}
						});
					}
				}
			}]
		},
		forceFit: true,
		columns: [{
			xtype: 'treecolumn',
			dataIndex: 'text',
			resizable: false,
			hideable: false,
			draggable: false,
			sortable: true,
			editor: 'textfield'
		}],
		store: {
			sorters: [{
				property: 'text',
				direction: 'ASC'
			}]
		},
		rowLines: false,
		columnLines: false,
		lines: true,
		hideHeaders: true,
		root: {
			text: 'Current project',
			expandable: true,
			expanded: true
		},
		listeners: {
			selectionchange: function (selection, records) {
				if (records.length && !records[0].isRoot()) {
					var stage = Canvace.stages.get(records[0].get('id'));
					propertyGrid.bind(stage, stage.getId());
				} else {
					propertyGrid.unbind();
				}
			}
		},
		plugins: [editingPlugin]
	});

	var projectNode = tree.getRootNode();

	function addNode(stage) {
		var id = stage.getId();
		var node;
		if (stage.isCurrent()) {
			node = projectNode.appendChild({
				id: id,
				text: id + ' (current stage)',
				cls: 'bold',
				leaf: true
			});
		} else {
			node = projectNode.appendChild({
				id: id,
				text: id,
				leaf: true,
				href: '/?stage=' + encodeURIComponent(id)
			});
		}
		stage.onLoad(function () {
			node.set({
				href: '',
				text: id + ' (current stage)',
				cls: 'bold'
			});
			node.commit();
		});
		stage.onUnload(function () {
			node.set({
				text: id,
				href: '/?stage=' + encodeURIComponent(id)
			});
			node.commit();
		});
		stage.onRename(function (newId) {
			if (!stage.isCurrent()) {
				node.set('href', '/?stage=' + encodeURIComponent(newId));
			}
			if (stage.isCurrent()) {
				node.set('text', newId + ' (current stage)');
			} else {
				node.set('text', newId);
			}
			node.commit();
		});
		stage.onDelete(function () {
			projectNode.removeChild(node);
		});
	}

	Canvace.stages.forEach(addNode);
	Canvace.stages.onCreate(function (id) {
		addNode(Canvace.stages.get(id));
	});

	container.add(tree);
}
