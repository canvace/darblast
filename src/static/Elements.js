function Elements(type, Element, ready) {
	var elements = {};

	function loadElement(id, callback) {
		Canvace.Ajax.get(type + '/' + id, function (element) {
			var loader = new Loader(function () {
				callback(element);
			});
			loader.get(type + '/' + id + '/frames/', function (frameIds) {
				element.frames = [];
				frameIds.forEach(function (frameId) {
					loader.get(type + '/' + id + '/frames/' + frameId, function (frameData) {
						var frame = {
							frameId: frameId,
							imageId: frameData.id
						};
						if ('duration' in frameData) {
							frame.duration = frameData.duration;
						}
						element.frames.push(frame);
					});
				});
				loader.allQueued();
			});
			loader.get(type + '/' + id + '/properties/', function (properties) {
				element.properties = properties;
			});
			loader.allQueued();
		});
	}

	Canvace.Ajax.get(type + '/', function (ids) {
		var loader = new Loader(ready);
		ids.forEach(function (id) {
			loader.queue(function (callback) {
				loadElement(id, function (element) {
					elements[id] = element;
					callback();
				});
			});
		});
		loader.allQueued();
	});

	var createHandlers = new EventHandlers();
	var updateHandlers = new EventHandlers();
	var deleteHandlers = new EventHandlers();
	var globalDeleteHandlers = new MultiSet();
	var createFramesHandlers = new EventHandlers();
	var updateFramesHandlers = new EventHandlers();
	var deleteFramesHandlers = new EventHandlers();
	var putPropertyHandlers = new EventHandlers();
	var deletePropertyHandlers = new EventHandlers();

	function ElementBase(id) {
		if (!(id in elements)) {
			throw 'Invalid element ID: ' + id;
		}
		var element = elements[id];

		this.onUpdate = function (handler) {
			return updateHandlers.registerHandler(id, handler);
		};
		this.onDelete = function (handler) {
			return deleteHandlers.registerHandler(id, handler);
		};

		this.getId = function () {
			return id;
		};

		this.getOffset = function () {
			return {
				x: element.offset.x,
				y: element.offset.y
			};
		};
		this.setOffset = function (x, y) {
			Canvace.Ajax.put(type + '/' + id, {
				offset: {
					x: x,
					y: y
				}
			});
		};
		this.setOffsetX = function (value) {
			Canvace.Ajax.put(type + '/' + id, {
				offset: {
					x: value,
					y: element.offset.y
				}
			});
		};
		this.setOffsetY = function (value) {
			Canvace.Ajax.put(type + '/' + id, {
				offset: {
					x: element.offset.x,
					y: value
				}
			});
		};

		this.project = function (i, j, k) {
			return Canvace.view.projectElement(element, i, j, k);
		};

		function Frame(frame) {
			this.getFrameId = function () {
				return frame.frameId;
			};
			this.getImageId = function () {
				return frame.imageId;
			};
			this.onUpdate = function (handler) {
				return updateFramesHandlers.registerHandler(id + '/' + frame.frameId, handler);
			};
			this.onDelete = function (handler) {
				return deleteFramesHandlers.registerHandler(id + '/' + frame.frameId, handler);
			};
			this.isLast = function () {
				return !('duration' in frame);
			};
			this.setLast = function () {
				Canvace.Ajax.put(type + '/' + id + '/frames/' + frame.frameId, {
					duration: false
				});
			};
			this.getDuration = function () {
				return frame.duration;
			};
			this.setDuration = function (value) {
				Canvace.Ajax.put(type + '/' + id + '/frames/' + frame.frameId, {
					duration: parseInt(value, 10)
				});
			};
			this._delete = function () {
				Canvace.Ajax._delete(type + '/' + id + '/frames/' + frame.frameId);
			};
		}

		this.hasFrames = function () {
			return !!element.frames.length;
		};
		this.getDimensions = function () {
			if (element.frames.length) {
				var image = Canvace.images.getImage(element.frames[0].imageId);
				return {
					width: image.width,
					height: image.height
				};
			} else {
				return {
					width: 0,
					height: 0
				};
			}
		};
		this.getFirstFrameId = function () {
			if (element.frames.length) {
				return element.frames[0].imageId;
			} else {
				return false;
			}
		};
		this.forEachFrame = function (callback) {
			element.frames.forEach(function (frame) {
				callback(new Frame(frame));
			});
		};
		this.addFrame = function (imageId, duration) {
			var data = {
				imageId: imageId
			};
			if (arguments.length > 1) {
				data.duration = parseInt(duration, 10);
			}
			Canvace.Ajax.post(type + '/' + id + '/frames', data);
		};
		this.onAddFrame = function (handler) {
			return createFramesHandlers.registerHandler(id, handler);
		};

		this.getLabels = function () {
			var labels = [];
			element.frames.forEach(function (frame) {
				labels.push(Canvace.images.get(frame.imageId).getLabels());
			});
			return labels;
		};

		this.getProperties = function () {
			return Ext.merge({}, element.properties);
		};
		this.getProperty = function (name) {
			return element.properties[name];
		};
		this.putProperty = function (name, value, callback) {
			Canvace.Ajax.put(type + '/' + id + '/properties/' + name, {
				value: value
			}, callback);
		};
		this.deleteProperty = function (name, callback) {
			Canvace.Ajax._delete(type + '/' + id + '/properties/' + name, callback);
		};
		this.onPutProperty = function (handler) {
			return putPropertyHandlers.registerHandler(id, handler);
		};
		this.onDeleteProperty = function (handler) {
			return deletePropertyHandlers.registerHandler(id, handler);
		};

		this._delete = function () {
			Canvace.Ajax._delete(type + '/' + id);
		};
	}

	Canvace.poller.poll(type, 'create', function (parameters) {
		var id = parameters.id;
		var element = (elements[id] = parameters.descriptor);
		element.frames = [];
		element.properties = {};
		createHandlers.fire(0, function (handler) {
			handler(new Element(ElementBase, id, elements[id]));
		});
	});

	Canvace.poller.poll(type, 'update', function (parameters) {
		var id = parameters.id;
		if (id in elements) {
			// TODO
		} else {
			elements[id] = parameters.descriptor;
			// TODO load frames and properties
			createHandlers.fire(0, function (handler) {
				handler(new Element(ElementBase, id, elements[id]));
			});
		}
	});

	Canvace.poller.poll(type, 'delete', function (parameters) {
		globalDeleteHandlers.fastForEach(function (handler) {
			handler(parameters.id);
		});
		deleteHandlers.fire(parameters.id);
		delete elements[parameters.id];
	});

	Canvace.poller.poll(type + '/frames', 'create', function () {
		// TODO
	});

	Canvace.poller.poll(type + '/frames', 'update', function () {
		// TODO
	});

	Canvace.poller.poll(type + '/frames', 'delete', function () {
		// TODO
	});

	Canvace.poller.poll(type + '/properties', 'put', function (parameters) {
		elements[parameters.id].properties[parameters.name] = parameters.value;
		putPropertyHandlers.fire(parameters.id, function (handler) {
			handler(parameters.name, parameters.value);
		});
	});

	Canvace.poller.poll(type + '/properties', 'delete', function (parameters) {
		delete elements[parameters.id].properties[parameters.name];
		deletePropertyHandlers.fire(parameters.id, function (handler) {
			handler(parameters.name);
		});
	});

	this.onCreate = function (handler) {
		return createHandlers.registerHandler(0, handler);
	};
	this.onDelete = globalDeleteHandlers.add;

	this.get = function (id) {
		if (id in elements) {
			return new Element(ElementBase, id, elements[id]);
		} else {
			throw 'Internal error: invalid element ID ' + id;
		}
	};
	this.forEach = function (callback) {
		for (var id in elements) {
			callback(new Element(ElementBase, id, elements[id]));
		}
	};
}
