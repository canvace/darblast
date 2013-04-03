function StageControls() {
	var container = Ext.getCmp('stage-controls');

	var tree = Ext.create('Ext.tree.Panel', {
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
				icon: '/resources/images/icons/pencil.png',
				tooltip: 'Load stage',
				handler: function () {
					// TODO rename stage
				}
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Remove stage',
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
		root: {
			text: 'Current project',
			expandable: true,
			expanded: true
		}
	});

	var projectNode = tree.getRootNode();

	function addNode(stage) {
		var id = stage.getId();
		var node = projectNode.appendChild({
			id: id,
			text: id,
			leaf: true
		});
		stage.onRename(function (newId) {
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
	container.add({
		region: 'south',
		split: true,
		title: 'Properties',
		height: 300
	});
}
