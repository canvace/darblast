function PropertyControls(container, config) {
	var store = new Ext.data.TreeStore({
		fields: [{
			name: 'name',
			type: 'string'
		}, 'value'],
		root: {
			expandable: true,
			expanded: true
		}
	});

	function NewPropertyDialog() {
		var dialog;

		function Panel(title, valueField) {
			var nameField = new Ext.form.TextField({
				fieldLabel: 'Name'
			});
			return {
				title: title,
				layout: 'vbox',
				items: [nameField, valueField],
				buttons: [{
					text: 'Add',
					handler: function () {
						store.getRootNode().appendChild({
							name: nameField.getValue(),
							value: valueField.getValue()
						});
						dialog.close();
						store.sync();
					}
				}]
			};
		}

		dialog = new Ext.window.Window({
			title: 'Add new property',
			modal: true,
			resizable: false,
			layout: 'accordion',
			items: [new Panel('Boolean property', new Ext.form.field.ComboBox({
				fieldLabel: 'Value',
				store: [[true, 'true'], [false, 'false']],
				value: true
			})), new Panel('Numeric property', new Ext.form.NumberField({
				fieldLabel: 'Value',
				value: 0
			})), new Panel('String property', new Ext.form.field.TextArea({
				fieldLabel: 'Value'
			}))],
			buttons: [{
				text: 'Cancel',
				handler: function () {
					dialog.close();
				}
			}]
		});
		dialog.show();
	}

	container.add(new Ext.tree.Panel(Ext.Object.merge(config || {}, {
		tbar: [{
			icon: '/resources/images/icons/add.png',
			text: 'Add property...',
			handler: function () {
				new NewPropertyDialog();
			}
		}, {
			icon: '/resources/images/icons/add.png',
			text: 'Add sub-property...',
			handler: function () {
				// TODO
			}
		}],
		rootVisible: false,
		rowLines: true,
		columnLines: true,
		lines: false,
		store: store,
		columns: [{
			dataIndex: 'name',
			text: 'Name',
			hideable: false,
			sortable: true
		}, {
			dataIndex: 'value',
			text: 'Value',
			hideable: false,
			sortable: false
			//plugins: ['cellediting']
		}, {
			xtype: 'actioncolumn',
			hideable: false,
			sortable: false,
			items: [{
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete property',
				handler: function (view, rowIndex, columnIndex, item, event, record) {
					record.remove();
				}
			}]
		}],
		listeners: {
			selectionchange: function () {
				// TODO
			}
		}
	})));

	this.bind = function (object) {
		var root = store.getRootNode();
		root.removeAll();
		(function walk(properties, node) {
			for (var key in properties) {
				switch (typeof properties[key]) {
				case 'null':
				case 'undefined':
				case 'boolean':
				case 'number':
					node.appendChild({
						name: key,
						value: properties[key]
					});
					break;
				case 'object':
					walk(properties[key], node.appendChild({
						name: key
					}));
					break;
				default:
					node.appendChild({
						name: key,
						value: properties[key].toString()
					});
				}
			}
		}(object.getProperties(), root));
	};

	this.unbind = function () {
		store.getRootNode().removeAll();
	};
}
