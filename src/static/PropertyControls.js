function PropertyControls(container, config) {
	var boundObject;

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
						var name = nameField.getValue();
						if (typeof boundObject.getProperty(name) !== 'undefined') {
							Ext.MessageBox.show({
								title: 'Error',
								msg: 'The property "' + name + '" already exists do you want to overwrite it?',
								buttons: Ext.MessageBox.OKCANCEL,
								icon: Ext.MessageBox.ERROR,
								fn: function (buttonId) {
									if (buttonId === Ext.MessageBox.OK) {
										boundObject.putProperty(name, valueField.getValue());
										dialog.close();
									}
								}
							});
						} else {
							boundObject.putProperty(name, valueField.getValue());
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

	var store = new Ext.data.TreeStore({
		fields: [{
			name: 'name',
			type: 'string'
		}, 'value'],
		root: {
			expandable: true,
			expanded: true,
			icon: Ext.BLANK_IMAGE_URL,
			name: '(none)'
		}
	});

	var bound = false;

	container.add(new Ext.tree.Panel(Ext.Object.merge(config || {}, {
		store: store,
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
					return !bound || record.isLeaf();
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

	var unbindHandlers = new EventHandlers();

	function rebind(newLabel) {
		unbindHandlers.fireAll();
		bound = !!newLabel;
		store.setRootNode({
			expandable: true,
			expanded: true,
			icon: Ext.BLANK_IMAGE_URL,
			name: newLabel || '(none)'
		});
	}

	this.bind = function (object, name) {
		rebind(name);
		boundObject = object;

		var walk;

		function addNode(parent, name, value) {
			switch (typeof value) {
			case 'undefined':
			case 'boolean':
			case 'number':
				parent.appendChild({
					leaf: true,
					icon: Ext.BLANK_IMAGE_URL,
					name: name,
					value: value
				});
				break;
			case 'object':
				if (value !== null) {
					walk(value, parent.appendChild({
						expandable: true,
						icon: Ext.BLANK_IMAGE_URL,
						name: name,
						value: '(object)'
					}));
				} else {
					parent.appendChild({
						leaf: true,
						icon: Ext.BLANK_IMAGE_URL,
						name: name,
						value: 'null'
					});
				}
				break;
			default:
				parent.appendChild({
					leaf: true,
					icon: Ext.BLANK_IMAGE_URL,
					name: name,
					value: value.toString()
				});
				break;
			}
		}

		walk = function (properties, node) {
			for (var key in properties) {
				addNode(node, key, properties[key]);
			}
		};

		walk(object.getProperties(), store.getRootNode());

		unbindHandlers.registerTrigger(0, object.onPutProperty(function (name) {
			var previous = store.getRootNode().findChild('name', name);
			if (previous) {
				previous.remove();
			}
			// TODO insert new node
		}));
		unbindHandlers.registerTrigger(0, object.onDeleteProperty(function (name) {
			var node = store.getRootNode().findChild('name', name);
			if (node) {
				node.remove();
			}
		}));
	};

	this.unbind = rebind;
}
