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
		return !!this.object;
	},
	put: function (operation, callback, scope) {
		if (this.object) {
			operation.setStarted();
			var fullProperties = this.object.getProperties();
			var updatedKeys = {};
			operation.getRecords().forEach(function (record) {
				var path = record.get('path').slice(0);
				updatedKeys[path[0]] = true;
				var lastKey = path.pop();
				var properties = fullProperties;
				path.forEach(function (key) {
					properties = properties[key];
				});
				properties[lastKey] = (function walk(node) {
					if (node.isLeaf()) {
						return node.get('value');
					} else {
						var result = {};
						node.eachChild(function (child) {
							result[child.get('name')] = walk(child);
						});
						return result;
					}
				}(record));
			});
			var loader = new Loader(function () {
				operation.setSuccessful();
				operation.setCompleted();
				callback.call(scope, operation);
			});
			var object = this.object;
			for (var key in updatedKeys) {
				loader.queue(function (callback) {
					object.putProperty(key, fullProperties[key], callback);
				});
			}
			loader.allQueued();
		} else {
			operation.setSuccessful();
			operation.setCompleted();
			callback.call(scope, operation);
		}
	},
	create: function () {
		this.put.apply(this, arguments);
	},
	read: function (operation, callback, scope) {
		if (this.object) {
			operation.setStarted();
			var Model = this.model;
			operation.resultSet = new Ext.data.ResultSet({
				records: (function walk(properties, path) {
					var children = [];
					for (var key in properties) {
						switch (typeof properties[key]) {
						case 'undefined':
						case 'boolean':
						case 'number':
							children.push(new Model({
								expandable: false,
								leaf: true,
								icon: Ext.BLANK_IMAGE_URL,
								name: key,
								value: properties[key],
								path: path.concat(key)
							}));
							break;
						case 'object':
							if (properties[key] !== null) {
								var subPath = path.concat(key);
								children.push(new Model({
									expandable: true,
									expanded: false,
									icon: Ext.BLANK_IMAGE_URL,
									name: key,
									value: '(object)',
									path: subPath,
									children: walk(properties[key], subPath)
								}));
							} else {
								children.push(new Model({
									expandable: false,
									leaf: true,
									icon: Ext.BLANK_IMAGE_URL,
									name: key,
									value: null,
									path: path.concat(key)
								}));
							}
							break;
						default:
							children.push(new Model({
								expandable: false,
								leaf: true,
								icon: Ext.BLANK_IMAGE_URL,
								name: key,
								value: properties[key].toString(),
								path: path.concat(key)
							}));
							break;
						}
					}
					children.forEach(function (record) {
						record.commit();
					});
					return children;
				}(this.object.getProperties(), [])),
				success: true,
				loaded: true
			});
		} else {
			operation.resultSet = new Ext.data.ResultSet({
				records: [],
				success: true,
				loaded: true
			});
		}
		operation.setSuccessful();
		operation.setCompleted();
		callback.call(scope, operation);
	},
	update: function () {
		this.put.apply(this, arguments);
	},
	destroy: function (operation, callback, scope) {
		if (this.object) {
			operation.setStarted();
			var fullProperties = this.object.getProperties();
			var updatedKeys = {};
			var deletedKeys = {};
			operation.getRecords().forEach(function (record) {
				var path = record.get('path').slice(0);
				if (path.length > 1) {
					updatedKeys[path[0]] = true;
					var lastKey = path.pop();
					var properties = fullProperties;
					path.forEach(function (key) {
						properties = properties[key];
					});
					delete properties[lastKey];
				} else {
					deletedKeys[path[0]] = true;
				}
			});
			var loader = new Loader(function () {
				operation.setSuccessful();
				operation.setCompleted();
				callback.call(scope, operation);
			});
			var object = this.object;
			(function () {
				for (var key in updatedKeys) {
					loader.queue(function (callback) {
						object.putProperty(key, fullProperties[key], callback);
					});
				}
			}());
			(function () {
				for (var key in deletedKeys) {
					loader.queue(function (callback) {
						object.deleteProperty(key, callback);
					});
				}
			}());
			loader.allQueued();
		}
		operation.setSuccessful();
		operation.setCompleted();
		callback.call(scope, operation);
	}
});

Ext.define('Darblast.form.field.NullCheckbox', {
	extend: 'Ext.form.field.Checkbox',
	alias: 'widget.darblast.nullcheckbox',
	getValue: function () {
		if (this.callParent()) {
			return null;
		} else {
			return {};
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
							var value = valueField.getValue();
							if ((typeof value !== 'object') || (value === null)) {
								parentNode.appendChild({
									expandable: false,
									leaf: true,
									icon: Ext.BLANK_IMAGE_URL,
									name: name,
									value: value,
									path: parentNode.get('path').concat([name])
								}).commit();
							} else {
								parentNode.appendChild({
									expandable: true,
									expanded: false,
									icon: Ext.BLANK_IMAGE_URL,
									name: name,
									value: '(object)',
									path: parentNode.get('path').concat([name])
								}).commit();
							}
							parentNode.commit();
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
			})), new Panel('Object property', new Ext.create('Darblast.form.field.NullCheckbox', {
				boxLabel: 'Set to null',
				checked: false
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
			}, 'value', {
				name: 'path',
				persist: false
			}],
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
					record.destroy();
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
				},
				edit: function (editor, event) {
					event.record.commit();
				}
			}
		}]
	})));

	var store = panel.getStore();
	proxy = store.getProxy();

	this.bind = function (object, name) {
		proxy.bind(object);
		store.setRootNode({
			expandable: true,
			expanded: true,
			icon: Ext.BLANK_IMAGE_URL,
			name: name,
			path: []
		});
	};

	this.unbind = function () {
		proxy.unbind();
		store.setRootNode({
			expandable: false,
			leaf: true,
			icon: Ext.BLANK_IMAGE_URL,
			name: '(no selection)'
		});
	};
}
