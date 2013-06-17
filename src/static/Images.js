/*
 *	Canvace Visual Development Environment, codenamed "Darblast".
 *	Copyright (C) 2013  Canvace Srl  <http://www.canvace.com/>
 *
 *	Dual licensed under the MIT and GPLv3 licenses.
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function Images(ready) {
	var images = {};
	var labels = {};

	var hierarchy = new Hierarchy({});

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
		hierarchy = new Hierarchy(labels);
		if (!count) {
			ready && ready();
		}
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
			return deleteHandlers.registerTrigger(id, handler);
		};

		this.getImage = function () {
			return image;
		};
		this.getLabels = function () {
			return Ext.Object.merge([], labels[id]);
		};
		this.setLabels = function (labels) {
			Canvace.Ajax.put('images/' + id, {
				labels: labels
			});
		};
		this.hasLabels = function (labelsToTest) {
			for (var i in labelsToTest) {
				if (!(function (label) {
					for (var i in labels[id]) {
						if (labels[id][i] == label) {
							return true;
						}
					}
					return false;
				}(labelsToTest[i]))) {
					return false;
				}
			}
			return true;
		};

		this._delete = function () {
			Canvace.Ajax._delete('images/' + id);
		};
	}

	Canvace.poller.poll('images', 'create', function (parameters) {
		loadImage(parameters.id, parameters.labels, function () {
			createHandlers.fire(0, function (handler) {
				handler(new ImageObject(parameters.id));
			});
		});
		hierarchy = new Hierarchy(labels);
		hierarchyHandlers.fire(0);
	});

	Canvace.poller.poll('images', 'update', function (parameters) {
		loadImage(parameters.id, parameters.labels, function () {
			updateHandlers.fire(parameters.id, function (handler) {
				handler(parameters.labels);
			});
		});
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
		return createHandlers.registerHandler(0, handler);
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

	this.getAllLabels = function () {
		var set = {};
		for (var id in labels) {
			labels[id].forEach(function (label) {
				set[label] = true;
			});
		}
		var array = [];
		for (var label in set) {
			array.push(label);
		}
		return array;
	};

	this.onHierarchyChange = function (handler) {
		return hierarchyHandlers.registerHandler(0, handler);
	};
}
