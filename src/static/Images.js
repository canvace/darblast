function Images() {
	var set = {};
	var hierarchy;

	var createHandlers = new EventHandlers();
	var updateHandlers = new EventHandlers();
	var hierarchyHandlers = new EventHandlers();
	var deleteHandlers = new EventHandlers();

	var objects = {};

	function loadImage(id, labels, callback) {
		var image = new Image();

		function loaded() {
			callback && callback(image);
		}

		image.addEventListener('load', loaded, false);
		image.addEventListener('error', loaded, false);
		image.src = 'images/' + id;

		set[id] = {
			id: id,
			labels: labels,
			image: image
		};
	}

	Canvace.Ajax.get('images/all', function (labelMap) {
		var count = 0;
		for (var id in labelMap) {
			count++;
			loadImage(id, labelMap, function () {
				if (!--count) {
					// TODO
				}
			});
		}
		hierarchy = new Hierarchy(labelMap);
	});

	function ImageObject(id) {
		this.getLabels = function () {
			return Ext.Object.merge({}, set[id].labels);
		};
		this.onUpdate = function (handler) {
			return updateHandlers.registerHandler(id, handler);
		};
		this.setLabels = function (labels, callback) {
			Canvace.Ajax.put('images/' + id + '/labels', labels, callback);
		};
		this.onDelete = function (handler) {
			return deleteHandlers.registerHandler(id, handler);
		};
		this._delete = function (callback) {
			Canvace.Ajax._delete('images/' + id, callback);
		};
	}

	new Poller('image', function (message) {
		switch (message.method) {
		case 'create':
			(function () {
				for (var id in message.labelMap) {
					loadImage(id, message.labelMap[id], (function (id) {
						return function () {
							createHandlers.fire(0, function (handler) {
								handler(id);
							});
						};
					}(id)));
				}
				// TODO update hierarchy
				hierarchyHandlers.fire(0);
			}());
			break;
		case 'update':
			(function () {
				for (var id in message.labelMap) {
					loadImage(id, message.labelMap[id], (function (id) {
						return function () {
							updateHandlers.fire(id, function (handler) {
								handler(id);
							});
						};
					}(id)));
				}
				// TODO update hierarchy
				hierarchyHandlers.fire(0);
			}());
			break;
		case 'delete':
			if (message.id in set) {
				deleteHandlers.fire(message.id);
				delete set[message.id];
				delete objects[message.id];
				// TODO update hierarchy
				hierarchyHandlers.fire(0);
			}
			break;
		}
	});

	this.getHierarchy = function () {
		return hierarchy;
	};

	this.onCreate = function (handler) {
		return createHandlers.regsterHandler(0, handler);
	};

	this.forEach = function (callback) {
		for (var id in set) {
			callback(objects[id] || (objects[id] = new ImageObject(id)));
		}
	};
}
