function PropertyControls(container, config) {
	function NewPropertyDialog(parentNode) {
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
						var name = nameField.getValue();
						var previous = parentNode.findChild('name', name);
						if (!previous || (Ext.MessageBox.show({
							title: 'Error',
							msg: 'The property "' + name + '" already exists do you want to overwrite it?',
							buttons: Ext.MessageBox.OKCANCEL,
							icon: Ext.MessageBox.ERROR
						}) === Ext.MessageBox.OK)) {
							previous && previous.remove();
							parentNode.appendChild({
								expandable: false,
								leaf: true,
								name: nameField.getValue(),
								value: valueField.getValue()
							});
							dialog.close();
						}
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

	var rootNode = container.add(new Ext.tree.Panel(Ext.Object.merge(config || {}, {
		store: {
			fields: [{
				name: 'name',
				type: 'string'
			}, 'value'],
			root: {
				expandable: true,
				expanded: true
			}
		},
		columns: [{
			dataIndex: 'name',
			text: 'Name',
			hideable: false,
			sortable: true
		}, {
			dataIndex: 'value',
			text: 'Value',
			hideable: false,
			sortable: false,
			plugins: [{
				ptype: 'cellediting',
				listeners: {
					beforeedit: function (editor, event) {
						return !event.record.get('expandable');
					}
				}
			}]
		}, {
			xtype: 'actioncolumn',
			hideable: false,
			sortable: false,
			items: [{
				icon: '/resources/images/icons/add.png',
				tooltip: 'Add sub-property...',
				handler: function (view, rowIndex, columnIndex, item, event, record) {
					new NewPropertyDialog(record);
				},
				isDisabled: function (view, rowIndex, columnIndex, item, record) {
					return record.isExpandable();
				}
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete property',
				handler: function (view, rowIndex, columnIndex, item, event, record) {
					record.remove();
				},
				isDisabled: function (view, rowIndex) {
					return !!rowIndex;
				}
			}]
		}]
	}))).getStore().getRootNode();

	this.bind = function (object) {
		rootNode.removeAll();
		(function walk(properties, node) {
			for (var key in properties) {
				switch (typeof properties[key]) {
				case 'undefined':
				case 'boolean':
				case 'number':
					node.appendChild({
						leaf: true,
						name: key,
						value: properties[key]
					});
					break;
				case 'object':
					if (properties[key] !== null) {
						walk(properties[key], node.appendChild({
							expandable: true,
							name: key,
							value: '(object)'
						}));
					} else {
						node.appendChild({
							leaf: true,
							name: key,
							value: 'null'
						});
					}
					break;
				default:
					node.appendChild({
						leaf: true,
						name: key,
						value: properties[key].toString()
					});
				}
			}
		}(object.getProperties(), rootNode));
	};

	this.unbind = function () {
		rootNode.removeAll();
	};
}
