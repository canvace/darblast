function Images() {
	var set = {};
	var hierarchy;

	var createHandlers = new EventHandlers();
	var updateHandlers = new EventHandlers();
	var hierarchyHandlers = new EventHandlers();
	var deleteHandlers = new EventHandlers();

	var objects = {};

	function fetch(labelMap) {
		for (var id in labelMap) {
			set[id] = {
				id: id,
				labels: labelMap[id],
				image: (function (id) {
					var image = new Image();
					function loaded() {
						// TODO
					}
					image.addEventListener('load', loaded, false);
					image.addEventListener('error', loaded, false);
					image.src = 'images/' + id;
					return image;
				}(id))
			};
		}
		hierarchy = new Hierarchy(labelMap);
	}

	Canvace.Ajax.get('images/all', fetch);

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
		case 'update':
			fetch(message.labelMap);
			hierarchyHandlers.fire(0);
			break;
		case 'delete':
			if (message.id in set) {
				deleteHandlers.fire(message.id);
				delete set[message.id];
				delete objects[message.id];
				// TODO update hierarchy
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
