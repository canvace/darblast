function Stages(ready) {
	var stages = {};

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
	var renameHandlers = new EventHandlers();
	var deleteHandlers = new EventHandlers();
	var putPropertyHandlers = new EventHandlers();
	var deletePropertyHandlers = new EventHandlers();

	function Stage(id) {
		// FIXME memory leak
		renameHandlers.registerHandler(id, function (newId) {
			id = newId;
		});

		var properties = stages[id];

		this.getId = function () {
			return id;
		};

		this.onRename = function (handler) {
			return renameHandlers.registerHandler(id, handler);
		};
		this.onDelete = function (handler) {
			return deleteHandlers.registerHandler(id, handler);
		};

		this.load = function (callback) {
			Canvace.Ajax.get('stages/' + id, callback);
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

		this.getProperty = function (name) {
			return properties[name];
		};
		this.putProperty = function (name, value) {
			Canvace.Ajax.put('stages/' + id + '/properties/' + name, value);
		};
		this.deleteProperty = function (name) {
			Canvace.Ajax._delete('stages/' + id + '/properties/' + name);
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
			createHandlers.fire(parameters.id, function (handler) {
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
		renameHandlers.fire(parameters.newId, function (handler) {
			handler(parameters.newId);
		});
	});

	Canvace.poller.poll('stages', 'delete', function (parameters) {
		deleteHandlers.fire(parameters.id);
		delete stages[parameters.id];
	});

	Canvace.poller.poll('stages/properties', 'put', function (parameters) {
		putPropertyHandlers.fire(parameters.stageId, function (handler) {
			stages[parameters.stageId][parameters.name] = parameters.value;
			handler(parameters.name, parameters.value);
		});
	});

	Canvace.poller.poll('stages/properties', 'delete', function (parameters) {
		deletePropertyHandlers.fire(parameters.stageId, function (handler) {
			delete stages[parameters.stageId][parameters.name];
			handler(parameters.name);
		});
	});

	this.get = function (id) {
		return new Stage(id);
	};

	this.onCreate = function (handler) {
		return createHandlers.registeHandler(0, handler);
	};

	this.forEach = function (callback) {
		for (var id in stages) {
			callback(new Stage(id));
		}
	};
}
