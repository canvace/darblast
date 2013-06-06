function ExportWizard() {
	var dialog = (new Ext.window.Window({
		title: 'Export Wizard',
		resizable: false,
		width: 400,
		modal: true,
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		buttons: [{
			text: 'Close',
			handler: function () {
				dialog.close();
			}
		}],
		items: [{
			xtype: 'radiogroup',
			defaults: {
				name: 'format'
			},
			items: [{
				inputValue: 'single',
				boxLabel: 'Single JSON file'
			}, {
				inputValue: 'separate',
				boxLabel: 'Separate images',
				checked: true
			}]
		}, {
			xtype: 'grid',
			store: {
				autoSync: true,
				fields: [{
					name: 'selected',
					type: 'boolean'
				}, {
					name: 'name',
					type: 'string'
				}, 'stage'],
				data: (function (records) {
					Canvace.stages.forEach(function (stage) {
						records.push({
							selected: stage.isCurrent(),
							name: stage.getName(),
							stage: stage
						});
					});
					return records;
				}([])),
				sorters: [{
					property: 'name',
					direction: 'ASC'
				}]
			},
			header: false,
			hideHeaders: true,
			columns: [{
				xtype: 'checkcolumn',
				flex: 1,
				dataIndex: 'selected'
			}, {
				flex: 4,
				dataIndex: 'name'
			}]
		}, {
			layout: 'accordion',
			items: [{
				title: 'Store to backend',
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				buttons: [{
					text: 'Store',
					handler: function () {
						// TODO
					}
				}],
				items: [{
					xtype: 'textfield',
					fieldLabel: 'Destination path'
				}, {
					xtype: 'directorytree',
					height: 200,
					listeners: {
						directoryselect: function () {
							// TODO
						}
					}
				}]
			}, {
				title: 'Download to frontend',
				buttons: [{
					text: 'Download',
					handler: function () {
						// TODO submit form
					}
				}]
			}]
		}]
	})).show();
}
