function Stages(ready) {
	var stages = {};
	var currentStageId;

	Canvace.Ajax.get('stages/', function (ids) {
		var loader = new Loader(ready);
		ids.forEach(function (id) {
			loader.get('stages/' + id + '/properties/', function (properties) {
				stages[id] = properties;
			});
		});
		loader.allQueued();
	});

	var createHandlers = new EventHandlers();
	var loadHandlers = new EventHandlers();
	var unloadHandlers = new EventHandlers();
	var renameHandlers = new EventHandlers();
	var deleteHandlers = new EventHandlers();
	var putPropertyHandlers = new EventHandlers();
	var deletePropertyHandlers = new EventHandlers();

	function Stage(id) {
		if (!(id in stages)) {
			throw 'Invalid stage ID: ' + id;
		}
		var properties = stages[id];

		// FIXME memory leak
		renameHandlers.registerHandler(id, function (newId) {
			id = newId;
		});

		this.getId = function () {
			return id;
		};
		this.isCurrent = function () {
			return id === currentStageId;
		};

		this.onLoad = function (handler) {
			return loadHandlers.registerHandler(id, handler);
		};
		this.onUnload = function (handler) {
			return unloadHandlers.registerHandler(id, handler);
		};
		this.onRename = function (handler) {
			return renameHandlers.registerHandler(id, handler);
		};
		this.onDelete = function (handler) {
			return deleteHandlers.registerHandler(id, handler);
		};

		this.load = function (callback) {
			Canvace.Ajax.get('stages/' + id, function (data) {
				if (typeof currentStageId !== 'undefined') {
					unloadHandlers.fire(currentStageId);
				}
				currentStageId = id;
				loadHandlers.fire(id);
				callback && callback(data);
			});
		};
		this.save = function (data, callback) {
			Canvace.Ajax.put('stages/' + id, {
				x0: data.x0,
				y0: data.y0,
				map: data.map,
				marks: data.marks,
				instances: data.instances
			}, callback);
		};

		this.getProperties = function () {
			return Ext.merge({}, properties);
		};
		this.getProperty = function (name) {
			return properties[name];
		};
		this.putProperty = function (name, value, callback) {
			Canvace.Ajax.put('stages/' + id + '/properties/' + name, {
				value: value
			}, callback);
		};
		this.deleteProperty = function (name, callback) {
			Canvace.Ajax._delete('stages/' + id + '/properties/' + name, callback);
		};
		this.onPutProperty = function (handler) {
			return putPropertyHandlers.registerHandler(id, handler);
		};
		this.onDeleteProperty = function (handler) {
			return deletePropertyHandlers.registerHandler(id, handler);
		};

		this._delete = function () {
			Canvace.Ajax._delete('stages/' + id);
		};
	}

	Canvace.poller.poll('stages', 'create', function (parameters) {
		Canvace.Ajax.get('stages/' + parameters.id + '/properties/', function (properties) {
			stages[parameters.id] = properties;
			createHandlers.fire(0, function (handler) {
				handler(parameters.id);
			});
		});
	});

	Canvace.poller.poll('stages', 'rename', function (parameters) {
		stages[parameters.newId] = stages[parameters.oldId];
		delete stages[parameters.oldId];
		createHandlers.rehash(parameters.oldId, parameters.newId);
		renameHandlers.rehash(parameters.oldId, parameters.newId);
		deleteHandlers.rehash(parameters.oldId, parameters.newId);
		putPropertyHandlers.rehash(parameters.oldId, parameters.newId);
		deletePropertyHandlers.rehash(parameters.oldId, parameters.newId);
		if (currentStageId === parameters.oldId) {
			currentStageId = parameters.newId;
		}
		renameHandlers.fire(parameters.newId, function (handler) {
			handler(parameters.newId);
		});
	});

	Canvace.poller.poll('stages', 'delete', function (parameters) {
		deleteHandlers.fire(parameters.id);
		delete stages[parameters.id];
	});

	Canvace.poller.poll('stages/properties', 'put', function (parameters) {
		stages[parameters.id][parameters.name] = parameters.value;
		putPropertyHandlers.fire(parameters.id, function (handler) {
			handler(parameters.name, parameters.value);
		});
	});

	Canvace.poller.poll('stages/properties', 'delete', function (parameters) {
		delete stages[parameters.id][parameters.name];
		deletePropertyHandlers.fire(parameters.id, function (handler) {
			handler(parameters.name);
		});
	});

	this.get = function (id) {
		return new Stage(id);
	};

	this.create = function (name) {
		Canvace.Ajax.post('stages/', {
			name: name
		});
	};

	this.onCreate = function (handler) {
		return createHandlers.registerHandler(0, handler);
	};

	this.forEach = function (callback) {
		for (var id in stages) {
			callback(new Stage(id));
		}
	};

	this.getCurrent = function () {
		if (typeof currentStageId !== 'undefined') {
			return new Stage(currentStageId);
		}
	};
}
