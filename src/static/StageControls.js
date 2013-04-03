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
					// TODO delete stage
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
		var node = projectNode.appendChild({
			text: stage.getId(),
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
