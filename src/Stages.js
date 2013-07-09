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

installHandler('/stages/', 'get', function (request, response) {
	this.stages.globalReadLock(function (release) {
		this.readdir('stages', function (entries) {
			release();
			response.json(entries);
		});
	});
});

installHandler('/stages/export', 'get', function (request) {
	this.images.globalReadLock(function () {
		request.query.ids.forEach(function () {
			// TODO
		});
	});
});

installHandler('/stages/', 'post', function (request, response) {
	if (/^[\w \.]+$/.test(request.body.name)) {
		this.stages.globalWriteLock(function (release) {
			this.exists('stages/' + request.body.name, function (exists) {
				if (exists) {
					release();
					response.json(400, 'A stage with the specified name already exists.');
				} else {
					this.putJSON('stages/' + request.body.name, {
						x0: 0,
						y0: 0,
						map: {},
						marks: {},
						instances: [],
						properties: {}
					}, function () {
						this.broadcast('stages', 'create', {
							id: request.body.name
						});
						release();
						response.json(true);
					});
				}
			});
		});
	} else {
		response.json(400, 'The specified stage name \"' + request.body.name + '\" contains invalid characters.');
	}
});

installHandler('/stages/:stageId', 'get', function (request, response) {
	this.getJSON('info', function (project) {
		this.stages.get(request.params.stageId, function (stage) {
			response.json({
				matrix: project.matrix,
				name: stage.name,
				x0: stage.x0,
				y0: stage.y0,
				map: stage.map,
				instances: stage.instances
			});
		});
	});
});

installHandler('/stages/:stageId', 'put', function (request) {
	function makeSet(array) {
		var set = {};
		array.forEach(function (id) {
			set[id] = true;
		});
		return set;
	}

	function sanitizeMap(tileIds) {
		var map = {};
		for (var k in request.body.map) {
			map[k] = {};
			for (var i in request.body.map[k]) {
				map[k][i] = {};
				for (var j in request.body.map[k][i]) {
					var id = parseInt(request.body.map[k][i][j], 10);
					if (id in tileIds) {
						map[k][i][j] = id;
					} else {
						throw 'Invalid tile ID: ' + id;
					}
				}
			}
		}
		return map;
	}

	function sanitizeInstances(entityIdSet) {
		var instances = [];
		for (var i in request.body.instances) {
			var instance = request.body.instances[i];
			instance.id = parseInt(instance.id, 10);
			if (instance.id in entityIdSet) {
				instances.push({
					id: instance.id,
					i: parseFloat(instance.i),
					j: parseFloat(instance.j),
					k: parseFloat(instance.k),
					properties: instance.properties
				});
			} else {
				throw 'Invalid entity ID: ' + instance.id;
			}
		}
		return instances;
	}

	this.tiles.globalReadLock(function () {
		this.readdir('tiles', function (tileIds) {
			var map = sanitizeMap(makeSet(tileIds));
			this.entities.globalReadLock(function () {
				this.readdir('entities', function (entityIds) {
					var instances = sanitizeInstances(makeSet(entityIds));
					this.stages.modifySync(request.params.stageId, function (stage) {
						if ('x0' in request.body) {
							stage.x0 = parseFloat(request.body.x0);
						}
						if ('y0' in request.body) {
							stage.y0 = parseFloat(request.body.y0);
						}
						stage.map = map;
						stage.instances = instances;
					});
				});
			});
		});
	});
});

installHandler('/stages/:stageId', 'delete', function (request, response) {
	this.stages.globalWriteLock(function (releaseStages) {
		this.stages.individualWriteLock(request.params.stageId, function (releaseStage) {
			this.unlink('stages/' + request.params.stageId, function () {
				this.broadcast('stages', 'delete', {
					id: request.params.stageId
				});
				releaseStage();
				releaseStages();
				response.json(true);
			});
		});
	});
});

installHandler('/stages/:stageId/id', 'put', function (request, response) {
	this.stages.rename(request.params.stageId, request.body.newId, function (success) {
		if (success) {
			this.broadcast('stages', 'rename', {
				oldId: request.params.stageId,
				newId: request.body.newId
			});
			response.json(true);
		} else {
			response.json(400, 'A stage with the specified name already exists.');
		}
	});
});

installHandler('/stages/:stageId/properties/', 'get', function (request, response) {
	this.stages.get(request.params.stageId, function (stage) {
		response.json(stage.properties);
	});
});

installHandler('/stages/:stageId/properties/:name', 'get', function (request, response) {
	this.stages.get(request.params.stageId, function (stage) {
		if (request.params.name in stage.properties) {
			response.json(stage.properties[request.params.name]);
		} else {
			response.json(400, 'Invalid property name: ' + request.params.name);
		}
	});
});

installHandler('/stages/:stageId/properties/:name', 'put', function (request) {
	this.stages.modifySync(request.params.stageId, function (stage) {
		stage.properties[request.params.name] = request.body.value;
		this.broadcast('stages/properties', 'put', {
			id: request.params.stageId,
			name: request.params.name,
			value: request.body.value
		});
	});
});

installHandler('/stages/:stageId/properties/:name', 'delete', function (request) {
	this.stages.modifySync(request.params.stageId, function (stage) {
		if (request.params.name in stage.properties) {
			delete stage.properties[request.params.name];
			this.broadcast('stages/properties', 'delete', {
				id: request.params.stageId,
				name: request.params.name
			});
		} else {
			throw 'Invalid property name: ' + request.params.name;
		}
	});
});
