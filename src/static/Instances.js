function Instances(instances) {
	var nextId = 0;
	instances = (function () {
		var set = {};
		for (var id in Canvace.instances) {
			id = parseInt(id, 10);
			if (id >= nextId) {
				nextId = id + 1;
			}
			var instance = instances[id];
			instance.erase = Canvace.buckets.addEntity(
				instance.i,
				instance.j,
				instance.k,
				Canvace.entities.get(instance.id)
				);
			set[id] = instance;
		}
		return set;
	}());

	Canvace.entities.onDelete(function (entityId) {
		var modified = false;
		for (var instanceId in instances) {
			if (instances[instanceId].id == entityId) {
				var instance = instances[instanceId];
				delete instances[instanceId];
				instance.erase();
				modified = true;
			}
		}
		if (modified) {
			/*
			 * FIXME usability issue: a user loses his entire history as soon as
			 * another one deletes something that's in his modifications.
			 */
			Canvace.history.erase();
		}
	});

	this.add = function (i, j, k, entityId) {
		var instance = {
			id: entityId,
			i: i,
			j: j,
			k: k,
			erase: Canvace.buckets.addEntity(i, j, k, Canvace.entities.get(entityId))
		};
		var id = nextId++;
		instances[id] = instance;
		Canvace.history.record({
			action: function () {
				instance.erase = Canvace.buckets.addEntity(i, j, k, Canvace.entities.get(entityId));
				instances[id] = instance;
			},
			reverse: function () {
				delete instances[id];
				instance.erase();
			}
		});
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
		this.getPosition = function () {
			return {
				i: instance.i,
				j: instance.j,
				k: instance.k
			};
		};
		this.setPosition = function (i1, j1, k1) {
			function doSet(i, j, k) {
				instance.erase();
				instance.i = i;
				instance.j = j;
				instance.k = k;
				instance.erase = Canvace.buckets.addEntity(i, j, k, Canvace.entities.get(instance.id));
			}
			var i0 = instance.i;
			var j0 = instance.j;
			var k0 = instance.k;
			doSet(i1, j1, k1);
			Canvace.history.record({
				action: function () {
					doSet(i1, j1, k1);
				},
				reverse: function () {
					doSet(i0, j0, k0);
				}
			});
		};
		this._delete = function () {
			if (id in instances) {
				delete instances[id];
				instance.erase();
				Canvace.history.record({
					action: function () {
						delete instances[id];
						instance.erase();
					},
					reverse: function () {
						instance.erase = Canvace.buckets.addEntity(
							instance.i,
							instance.j,
							instance.k,
							Canvace.entities.get(instance.id)
							);
						instances[id] = instance;
					}
				});
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
}
