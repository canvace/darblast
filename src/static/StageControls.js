function StageControls() {
	var container = Ext.getCmp('stage-controls');

	var propertyGrid = new PropertyControls(container, {
		region: 'south',
		split: true,
		collapsible: true,
		title: 'Properties',
		height: 300
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
					if (selectedNodes.length) {
						window.location = '/?stage=' + encodeURIComponent(selectedNodes[0].get('id'));
					}
				}
			}, {
				icon: '/resources/images/icons/pencil.png',
				tooltip: 'Rename stage',
				handler: function () {
					// TODO rename stage
				}
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete stage...',
				handler: function () {
					var selectedNodes = tree.getSelectionModel().getSelection();
					if (selectedNodes.length) {
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
			editor: 'textfield'
		}],
		rowLines: false,
		columnLines: false,
		lines: true,
		root: {
			text: 'Current project',
			expandable: true,
			expanded: true
		},
		listeners: {
			selectionchange: function (selection, records) {
				if (records.length) {
					var stage = Canvace.stages.get(records[0].get('id'));
					propertyGrid.bind(stage, stage.getId());
				} else {
					propertyGrid.unbind();
				}
			}
		},
		plugins: [new Ext.grid.plugin.CellEditing({
			clicksToEdit: 2
		})]
	});

	var projectNode = tree.getRootNode();

	function addNode(stage) {
		var id = stage.getId();
		var node;
		if (stage.isCurrent()) {
			node = projectNode.appendChild({
				id: id,
				text: id + ' (current stage)',
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
			node.set('href', '');
			node.set('text', id + ' (current stage)');
		});
		stage.onUnload(function () {
			node.set('text', id);
			node.set('href', '/?stage=' + encodeURIComponent(id));
		});
		stage.onRename(function (newId) {
			if (!stage.isCurrent()) {
				node.set('href', '/?stage=' + encodeURIComponent(newId));
			}
			node.set('text', newId);
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
