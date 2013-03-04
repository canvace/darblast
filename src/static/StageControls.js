function StageControls() {
	var container = Ext.getCmp('stage-controls');

	var tree = Ext.create('Ext.tree.Panel', {
		region: 'center',
		tbar: {
			xtype: 'toolbar',
			items: [{
				icon: '/resources/images/icons/add.png',
				tooltip: 'New stage...'
			}, {
				icon: '/resources/images/icons/pencil.png',
				tooltip: 'Load stage',
				disabled: true
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Remove stage',
				disabled: true
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
			text: stage.getId()
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
		addNode(Canvace.get(id));
	});

	container.add(tree);
	container.add({
		region: 'south',
		split: true,
		title: 'Properties',
		height: 300
	});
}
