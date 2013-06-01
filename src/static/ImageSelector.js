function ImageSelector(multiple, callback, cancel) {
	multiple = !!multiple;
	var selectedIds = [];

	var view = new Ext.view.View({
		xtype: 'dataview',
		region: 'center',
		cls: 'view',
		autoScroll: true,
		store: {
			fields: [{
				name: 'id',
				type: 'string'
			}],
			data: (function () {
				var images = [];
				Canvace.images.forEach(function (image) {
					images.push({
						id: image.getId()
					});
				});
				return images;
			}())
		},
		tpl: [
			'<tpl for=".">',
			'	<div class="thumb-wrap">',
			'		<div class="thumb"><img src="images/{id}" alt=""></div>',
			'	</div>',
			'</tpl>',
			'<div class="x-clear"></div>'
		],
		multiSelect: multiple,
		trackOver: true,
		overItemCls: 'x-item-over',
		itemSelector: 'div.thumb-wrap',
		emptyText: 'No images',
		plugins: multiple ? [
			Ext.create('Ext.ux.DataView.DragSelector', {})
		] : [],
		listeners: {
			selectionchange: function (selectionModel, selected) {
				selectedIds = selected.map(function (record) {
					return record.get('id');
				});
			}
		}
	});

	var store = view.getStore();

	var dialog = new Ext.window.Window({
		title: multiple ? 'Select one or more images' : 'Select an image',
		modal: true,
		resizable: true,
		width: 600,
		height: 400,
		layout: 'border',
		items: [{
			xtype: 'treepanel',
			region: 'west',
			title: 'Categories',
			header: false,
			collapsible: true,
			collapsed: false,
			split: true,
			width: 150,
			allowDeselect: true,
			fields: ['text', 'labels'],
			root: (function walk(node) {
				var config = {
					text: node.getName(),
					labels: node.getAllLabels(),
					expandable: true,
					expanded: node.hasChildren(),
					children: []
				};
				node.forEachChild(function (child) {
					config.children.push(walk(child));
				});
				return config;
			}(new (Canvace.images.getHierarchy()).Root('All categories'))),
			listeners: {
				selectionchange: function (selectionModel, selected) {
					if (selected.length && !selected[0].isRoot()) {
						var labels = selected[0].get('labels');
						store.filterBy(function (record) {
							return Canvace.images.get(record.get('id')).hasLabels(labels);
						});
					} else {
						store.clearFilter();
					}
				}
			}
		}, view],
		buttons: [{
			text: 'OK',
			handler: function () {
				dialog.close();
				callback && callback(selectedIds);
			}
		}, {
			text: 'Cancel',
			handler: function () {
				dialog.close();
				cancel && cancel();
			}
		}]
	}).show();
}
