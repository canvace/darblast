Ext.define('Darblast.properties.Proxy', {
	extend: 'Ext.data.proxy.Proxy',
	alias: 'proxy.darblast.properties',
	bind: function (object) {
		this.object = object;
	},
	unbind: function () {
		this.object = null;
	},
	isBound: function () {
		return !!this.Object;
	},
	create: function (operation, callback, scope) {
		if (this.object) {
			operation.getRecords().forEach(function () {
				// TODO
			});
		} else {
			operation.setSuccessful();
			operation.setCompleted();
			callback.call(scope, operation);
		}
	},
	read: function (operation, callback, scope) {
		if (this.object) {
			var rootNode = new Ext.data.TreeModel({
				expandable: true,
				expanded: true,
				icon: Ext.BLANK_IMAGE_URL,
				name: this.object.getId()
			});
			var count = 0;
			(function walk(properties, node) {
				for (var key in properties) {
					switch (typeof properties[key]) {
					case 'boolean':
					case 'number':
						count++;
						node.appendChild({
							expandable: false,
							leaf: true,
							icon: Ext.BLANK_IMAGE_URL,
							name: key,
							value: properties[key]
						});
						break;
					case 'object':
						if (properties[key] !== null) {
							count++;
							walk(properties[key], node.appendChild({
								expandable: true,
								expanded: false,
								icon: Ext.BLANK_IMAGE_URL,
								name: key,
								value: '(object)'
							}));
						} else {
							count++;
							node.appendChild({
								expandable: false,
								leaf: true,
								icon: Ext.BLANK_IMAGE_URL,
								name: key,
								value: null
							});
						}
						break;
					default:
						count++;
						node.appendChild({
							expandable: false,
							leaf: true,
							icon: Ext.BLANK_IMAGE_URL,
							name: key,
							value: properties[key].toString()
						});
						break;
					}
				}
			}(this.object.getProperties(), rootNode));
			operation.resultSet = new Ext.data.ResultSet({
				records: [rootNode],
				success: true,
				loaded: true,
				count: count,
				totale: count
			});
		} else {
			operation.resultSet = new Ext.data.ResultSet({
				records: [{
					expandable: false,
					leaf: true,
					icon: Ext.BLANK_IMAGE_URL,
					name: '(no selection)'
				}],
				success: true,
				loaded: true,
				count: 1,
				totale: 1
			});
		}
		operation.setSuccessful();
		operation.setCompleted();
		callback.call(scope, operation);
	},
	update: function (operation, callback, scope) {
		if (this.object) {
			operation.getRecords().forEach(function () {
				// TODO
			});
		} else {
			operation.setSuccessful();
			operation.setCompleted();
			callback.call(scope, operation);
		}
	},
	destroy: function (operation, callback, scope) {
		if (this.object) {
			operation.getRecords().forEach(function () {
				// TODO
			});
		} else {
			operation.setSuccessful();
			operation.setCompleted();
			callback.call(scope, operation);
		}
	}
});

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
						if (previous) {
							Ext.MessageBox.show({
								title: 'Error',
								msg: 'The property "' + name + '" already exists do you want to overwrite it?',
								buttons: Ext.MessageBox.OKCANCEL,
								icon: Ext.MessageBox.ERROR,
								fn: function (buttonId) {
									if (buttonId === Ext.MessageBox.OK) {
										previous.set('value', valueField.getValue());
										dialog.close();
									}
								}
							});
						} else {
							parentNode.appendChild({
								expandable: false,
								leaf: true,
								icon: Ext.BLANK_IMAGE_URL,
								name: name,
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
				value: true,
				editable: false
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

	var proxy;

	var panel = container.add(new Ext.tree.Panel(Ext.Object.merge(config || {}, {
		store: {
			autoLoad: true,
			autoSync: true,
			fields: [{
				name: 'name',
				type: 'string'
			}, 'value'],
			proxy: 'darblast.properties',
			root: {
				expandable: false,
				leaf: false,
				icon: Ext.BLANK_IMAGE_URL,
				name: '(no selection)'
			}
		},
		rowLines: true,
		columnLines: true,
		lines: false,
		columns: [{
			xtype: 'treecolumn',
			dataIndex: 'name',
			text: 'Name',
			hideable: false,
			sortable: true
		}, {
			dataIndex: 'value',
			text: 'Value',
			hideable: false,
			sortable: false
		}, {
			xtype: 'actioncolumn',
			hideable: false,
			sortable: false,
			width: 48,
			items: [{
				icon: '/resources/images/icons/add.png',
				tooltip: 'Add sub-property...',
				handler: function (view, rowIndex, columnIndex, item, event, record) {
					new NewPropertyDialog(record);
				},
				isDisabled: function (view, rowIndex, columnIndex, item, record) {
					return !proxy || !proxy.isBound() || record.isLeaf();
				}
			}, {
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete property',
				handler: function (view, rowIndex, columnIndex, item, event, record) {
					record.remove();
				},
				isDisabled: function (view, rowIndex) {
					return !rowIndex;
				}
			}]
		}],
		plugins: [{
			ptype: 'cellediting',
			clicksToEdit: 1,
			listeners: {
				beforeedit: function (editor, event) {
					if ((event.column.dataIndex === 'value') && event.record.isLeaf()) {
						switch (typeof event.record.get('value')) {
						case 'boolean':
							event.column.setEditor({
								xtype: 'combobox',
								store: [[true, 'true'], [false, 'false']],
								editable: false
							});
							break;
						case 'number':
							event.column.setEditor({
								xtype: 'numberfield',
								allowOnlyWhitespace: false
							});
							break;
						case 'object':
							return false;
						default:
							event.column.setEditor({
								xtype: 'textfield'
							});
							break;
						}
					} else {
						return false;
					}
				}
			}
		}]
	})));

	var store = panel.getStore();
	proxy = store.getProxy();

	this.bind = function (object) {
		proxy.bind(object);
		store.load();
	};

	this.unbind = function () {
		proxy.unbind();
		store.load();
	};
}
