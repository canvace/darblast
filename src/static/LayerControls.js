function LayerControls() {
	var store;
	var grid = new Ext.grid.Panel({
		header: false,
		hideHeaders: true,
		store: {
			autoSync: true,
			fields: [{
				name: 'index',
				type: 'int'
			}, {
				name: 'text',
				type: 'string'
			}, {
				name: 'enabled',
				type: 'boolean'
			}],
			sorters: [{
				property: 'index',
				direction: 'DESC'
			}]
		},
		columns: [{
			xtype: 'checkcolumn',
			flex: 1,
			dataIndex: 'enabled',
			draggable: false,
			hideable: false,
			sortable: false,
			listeners: {
				checkchange: function () {
					// TODO
				}
			}
		}, {
			flex: 4,
			dataIndex: 'text',
			draggable: false,
			hideable: false,
			sortable: false
		}, {
			xtype: 'actioncolumn',
			flex: 1,
			draggable: false,
			hideable: false,
			icon: '/resources/images/icons/delete.png',
			tooltip: 'Erase layer',
			handler: function (view, rowIndex, colIndex, item, event, record) {
				if (Canvace.layers.erase(record.get('index'))) {
					record.destroy();
				}
				Canvace.renderer.render();
			}
		}],
		forceFit: true,
		tbar: [{
			icon: '/resources/images/icons/page_white_get.png',
			tooltip: 'Add layer atop',
			handler: function () {
				Canvace.layers.addAbove(function (index) {
					store.add({
						index: index,
						text: 'Layer ' + index,
						enabled: true
					});
				});
				Canvace.renderer.render();
			}
		}, {
			icon: '/resources/images/icons/page_white_put.png',
			tooltip: 'Add layer beneath',
			handler: function () {
				Canvace.layers.addBelow(function (index) {
					store.add({
						index: index,
						text: 'Layer ' + index,
						enabled: true
					});
				});
				Canvace.renderer.render();
			}
		}],
		listeners: {
			selectionchange: function (selectionModel, selected) {
				if (selected.length) {
					Canvace.layers.select(selected[0].get('index'));
					Canvace.renderer.render();
				}
			}
		}
	});

	store = grid.getStore();
	Canvace.layers.forEach(function (index) {
		store.add({
			index: index,
			text: 'Layer ' + index,
			enabled: Canvace.layers.isOn(index)
		});
	});

	Ext.getCmp('layer-controls').add(grid);
}
