Ext.define('Darblast.ux.DirectoryTree', {
	extend: 'Ext.tree.Panel',
	alias: 'widget.directorytree',
	constructor: function (config) {
		config = config || {};
		this.callParent([config]);
		this.getStore().load();
		this.addListener('selectionchange', function (selectionModel, records) {
			var fullPath = null;
			if (records.length) {
				fullPath = records[0].get('fullPath');
			}
			this.fireEvent('directoryselect', fullPath);
		});
		if ('initialPath' in config) {
			this.selectPath('/root' + config.initialPath, 'baseName');
		}
	},

	rootVisible: false,

	store: {
		autoLoad: true,
		fields: [{
			name: 'text',
			type: 'string'
		}, {
			name: 'baseName',
			type: 'string'
		}, {
			name: 'fullPath',
			type: 'string'
		}],
		proxy: {
			type: 'rest',
			url: '/directories/',
			reader: {
				type: 'json',
				root: 'data'
			}
		},
		root: {
			baseName: 'root'
		}
	},

	selectPath: function (path) {
		this.callParent(['/root' + path, 'baseName']);
	}
});
