function PropertyControls(container, config) {
	var createHandlers = new EventHandlers();
	var editHandlers = new EventHandlers();
	var deleteHandlers = new EventHandlers();

	var store = container.add(Ext.Object.merge(config || {}, {
		xtype: 'grid',
		columns: [{
			text: 'Name',
			sortable: true
		}, {
			text: 'Value'
		}, {}],
		plugins: [{
			ptype: 'cellediting'
		}, {
			ptype: 'rowexpander'
		}]
	})).getStore();

	this.Bond = function (object) {
		store.removeAll();

		var id = object.getId();

		object.onRename(function (newId) {
			createHandlers.rehash(id, newId);
			editHandlers.rehash(id, newId);
			deleteHandlers.rehash(id, newId);
			id = newId;
		});

		(function walk(properties) {
			for (var key in properties) {
				(function () {
					function add(type, value) {
						store.add({
							fields: [{
								name: 'Name',
								type: 'string',
								defaultValue: key
							}, {
								name: 'Value',
								type: type,
								defaultValue: value
							}]
						});
					}
					switch (typeof properties[key]) {
					case 'boolean':
						add('boolean', properties[key]);
						break;
					case 'number':
						add('float', properties[key]);
						break;
					case 'object':
						walk(properties[key]);
						break;
					default:
						add('string', properties[key].toString());
						break;
					}
				}());
			}
		}(object.getProperties()));

		this.onCreate = function (handler) {
			return createHandlers.registerHandler(id, handler);
		};
		this.onEdit = function (handler) {
			return editHandlers.registerHandler(id, handler);
		};
		this.onDelete = function (handler) {
			return deleteHandlers.registerHandler(id, handler);
		};
	};
}
