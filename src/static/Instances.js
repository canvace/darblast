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

function Instances(instances) {
	var nextId = 0;
	(function () {
		for (var id in instances) {
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
		}
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
			Canvace.renderer.render();
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

		var positionBookmark = {
			i: instance.i,
			j: instance.j,
			k: instance.k
		};

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
		this.setPosition = function (i, j, k, silent) {
			function doSet(i, j, k) {
				instance.erase();
				instance.i = i;
				instance.j = j;
				instance.k = k;
				instance.erase = Canvace.buckets.addEntity(i, j, k, Canvace.entities.get(instance.id));
			}
			doSet(i, j, k);
			if (!silent) {
				(function (i0, j0, k0, i1, j1, k1) {
					Canvace.history.record({
						action: function () {
							doSet(i1, j1, k1);
						},
						reverse: function () {
							doSet(i0, j0, k0);
						}
					});
				}(positionBookmark.i, positionBookmark.j, positionBookmark.k, i, j, k));
				positionBookmark = {
					i: i,
					j: j,
					k: k
				};
			}
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

	this.updateRepositionedEntity = function (id) {
		var entity = Canvace.entities.get(id);
		for (var instanceId in instances) {
			var instance = instances[instanceId];
			instance.erase();
			instance.erase = Canvace.buckets.addEntity(
				instance.i,
				instance.j,
				instance.k,
				entity
				);
		}
	};
}
