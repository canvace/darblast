function Images(ready) {
	var images = {};
	var labels = {};

	var hierarchy;

	var createHandlers = new EventHandlers();
	var updateHandlers = new EventHandlers();
	var hierarchyHandlers = new EventHandlers();
	var deleteHandlers = new EventHandlers();

	function loadImage(id, imageLabels, callback) {
		var image = new Image();

		function loaded() {
			callback && callback(image);
		}

		image.addEventListener('load', loaded, false);
		image.addEventListener('error', loaded, false);
		image.src = 'images/' + id;

		images[id] = image;
		labels[id] = imageLabels;
	}

	Canvace.Ajax.get('images/', function (labelMap) {
		var count = 0;
		for (var id in labelMap) {
			count++;
			loadImage(id, labelMap[id], function () {
				if (!--count) {
					ready && ready();
				}
			});
		}
		if (!count) {
			ready && ready();
		}
		hierarchy = new Hierarchy(labels);
	});

	function ImageObject(id) {
		if (!(id in images)) {
			throw 'Invalid image ID: ' + id;
		}
		var image = images[id];

		this.getId = function () {
			return id;
		};

		this.onUpdate = function (handler) {
			return updateHandlers.registerHandler(id, handler);
		};
		this.onDelete = function (handler) {
			return deleteHandlers.registerHandler(id, handler);
		};

		this.getImage = function () {
			return image;
		};
		this.getLabels = function () {
			return Ext.Object.merge({}, labels[id]);
		};
		this.setLabels = function (labels) {
			Canvace.Ajax.put('images/' + id + '/labels', labels);
		};

		this._delete = function () {
			Canvace.Ajax._delete('images/' + id);
		};
	}

	Canvace.poller.poll('images', 'create', function (parameters) {
		for (var id in parameters.labelMap) {
			loadImage(id, parameters.labelMap[id], (function (id) {
				return function () {
					createHandlers.fire(0, function (handler) {
						handler(id);
					});
				};
			}(id)));
		}
		hierarchy = new Hierarchy(labels);
		hierarchyHandlers.fire(0);
	});

	Canvace.poller.poll('images', 'update', function (parameters) {
		for (var id in parameters.labelMap) {
			loadImage(id, parameters.labelMap[id], (function (id) {
				return function () {
					updateHandlers.fire(id, function (handler) {
						handler(id);
					});
				};
			}(id)));
		}
		hierarchy = new Hierarchy(labels);
		hierarchyHandlers.fire(0);
	});

	Canvace.poller.poll('images', 'delete', function (parameters) {
		if (parameters.id in images) {
			deleteHandlers.fire(parameters.id);
			delete images[parameters.id];
			delete labels[parameters.id];
			hierarchy = new Hierarchy(labels);
			hierarchyHandlers.fire(0);
		}
	});

	this.getHierarchy = function () {
		return hierarchy;
	};

	this.onCreate = function (handler) {
		return createHandlers.regsterHandler(0, handler);
	};

	this.get = function (id) {
		if (id in images) {
			return new ImageObject(id);
		} else {
			throw 'Invalid image ID ' + id;
		}
	};
	this.getImage = function (id) {
		if (id in images) {
			return images[id];
		} else {
			throw 'Invalid image ID ' + id;
		}
	};
	this.forEach = function (callback) {
		for (var id in images) {
			callback(new ImageObject(id));
		}
	};
}
