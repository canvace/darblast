function Instances(instances) {
	(function () {
		for (var id in Canvace.instances) {
			var instance = instances[id];
			instance.dirty = false;
			instance.erase = Canvace.buckets.addEntity(instance.i, instance.j, instance.k, Canvace.entities.get(instance.id));
		}
	}());

	var nextId = (function () {
		var result = 0;
		for (var id in instances) {
			id = parseInt(id, 10);
			if (id >= result) {
				result = id + 1;
			}
		}
		return result;
	}());

	var dirty = false;

	this.add = function (i, j, k, id) {
		dirty = true;
		instances[nextId++] = {
			id: id,
			i: i,
			j: j,
			k: k,
			dirty: true,
			erase: Canvace.buckets.addEntity(i, j, k, Canvace.entities.get(id))
		};
	};

	function Instance(id) {
		if (!(id in instances)) {
			throw 'Invalid instance ID: ' + id;
		}
		id = parseInt(id, 10);
		var instance = instances[id];
		this.getId = function () {
			return id;
		};
		this.getEntity = function () {
			return Canvace.entities.get(instance.id);
		};
		this.isDirty = function () {
			return instance.dirty;
		};
		this.getPosition = function () {
			return {
				i: instance.i,
				j: instance.j,
				k: instance.k
			};
		};
		this.setPosition = function (i, j, k) {
			instance.erase();
			instance.i = i;
			instance.j = j;
			instance.k = k;
			instance.dirty = true;
			instance.erase = Canvace.buckets.addEntity(i, j, k, Canvace.entities.get(instance.id));
		};
		this._delete = function () {
			if (delete instances[id]) {
				dirty = true;
				instance.erase();
			}
		};
	}

	this.pick = function (x, y) {
		(function () {
			var origin = Canvace.view.getOrigin();
			x -= origin.x;
			y -= origin.y;
		}());
		var result = false;
		var z = false;
		for (var id in instances) {
			var instance = instances[id];
			var entity = Canvace.entities.get(instance.id);
			var p = entity.project(instance.i, instance.j, instance.k);
			var dimensions = entity.getDimensions();
			if ((x >= p[0]) && (y >= p[1]) && (x <= p[0] + dimensions.width) && (y <= p[1] + dimensions.height)) {
				if ((z === false) || (p[2] > z)) {
					z = p[2];
					result = new Instance(id);
				}
			}
		}
		return result;
	};

	this.forEach = function (action) {
		for (var id in instances) {
			action(new Instance(id));
		}
	};

	this.isDirty = function () {
		return dirty;
	};
	this.clearDirty = function () {
		dirty = false;
		for (var id in instances) {
			instances[id].dirty = false;
		}
	};
}
