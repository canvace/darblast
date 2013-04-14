Ext.define('Canvace.data.Property', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'name',
		type: 'string'
	}, 'value']
});

function PropertyControls(container, config) {
	var store = container.add(Ext.create('Ext.grid.Panel', Ext.Object.merge(config || {}, {
		tbar: [{
			text: 'Add property...',
			handler: function () {
				var dialog;
				function Panel(title, valueField) {
					var nameField = Ext.create('Ext.form.TextField', {
						fieldLabel: 'Name'
					});
					return {
						title: title,
						layout: 'vbox',
						items: [nameField, valueField],
						buttons: [{
							text: 'Add',
							handler: function () {
								store.add({
									name: nameField.getValue(),
									value: valueField.getValue()
								});
								dialog.close();
								store.sync();
							}
						}]
					};
				}
				dialog = Ext.create('Ext.window.Window', {
					title: 'Add new property',
					modal: true,
					resizable: false,
					layout: 'accordion',
					items: [new Panel('Boolean property', Ext.create('Ext.form.field.ComboBox', {
						fieldLabel: 'Value',
						store: [[true, 'true'], [false, 'false']],
						value: true
					})), new Panel('Numeric property', Ext.create('Ext.form.NumberField', {
						fieldLabel: 'Value',
						value: 0
					})), new Panel('String property', Ext.create('Ext.form.field.TextArea', {
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
		}, {
			text: 'Add sub-property...',
			handler: function () {
				// TODO
			}
		}],
		store: {
			model: 'Canvace.data.Property'
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
			sortable: false
			//plugins: ['cellediting']
		}, {
			xtype: 'actioncolumn',
			hideable: false,
			sortable: false,
			items: [{
				icon: '/resources/images/icons/delete.png',
				tooltip: 'Delete property',
				handler: function (view, rowIndex) {
					view.getStore().removeAt(rowIndex);
				}
			}]
		}]
	}))).getStore();

	this.bind = function () {
		// TODO
	};

	this.unbind = function () {
		// TODO
	};
}
