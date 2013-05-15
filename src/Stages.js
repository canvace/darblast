installHandler('/stages/', 'get', function (request, response) {
	this.stages.globalReadLock(function (release) {
		this.readdir('stages', function (entries) {
			release();
			response.json(entries);
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

installHandler('/stages/:stageId', 'put', function (request, response) {
	function sanitizeMap(tileIds) {
		var tiles = {};
		tileIds.forEach(function (id) {
			tiles[id] = true;
		});
		var map = {};
		for (var k in request.body.map) {
			map[k] = {};
			for (var i in request.body.map[k]) {
				map[k][i] = {};
				for (var j in request.body.map[k][i]) {
					var id = parseInt(request.body.map[k][i][j], 10);
					if (id in tiles) {
						map[k][i][j] = id;
					} else {
						throw 'Invalid tile ID: ' + id;
					}
				}
			}
		}
		return map;
	}

	function sanitizeInstances(entityIds) {
		var entities = {};
		entityIds.forEach(function (id) {
			entities[id] = true;
		});
		var instances = [];
		for (var i in request.body.instances) {
			var instance = request.body.instances[i];
			instance.id = parseInt(instance.id, 10);
			if (instance.id in entities) {
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

	this.tiles.globalReadLock(function (releaseTiles) {
		this.readdir('tiles', function (tileIds) {
			try {
				var map = sanitizeMap(tileIds);
				this.entities.globalReadLock(function (releaseEntities) {
					this.readdir('entities', function (entityIds) {
						try {
							var instances = sanitizeInstances(entityIds);
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
						} catch (e) {
							releaseEntities();
							releaseTiles();
							response.json(400, e.toString());
						}
					});
				});
			} catch (e) {
				releaseTiles();
				response.json(400, e.toString());
			}
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

installHandler('/stages/:stageId/id', 'put', function () {
	// TODO
});

installHandler('/stages/:stageId/export', 'get', function (request) {
	this.stages.get(request.params.stageId, function () {
		// TODO
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
