app.get('/stage/:stageId/', function (request, response) {
	response.render('main.handlebars');
});

(function () {
	installHandler('/stages', 'get', function (request, response) {
		this.stages.globalReadLock(function (release) {
			this.readdir('stages', function (entries) {
				release();
				response.json(entries);
			});
		});
	});

	installHandler('/stage/', 'post', function () {
		// TODO
	});

	installHandler('/stage/:stageId', 'get', function (request, response) {
		this.getJSON('info', function (project) {
			this.stages.individualReadLock(request.params.stageId, function (release) {
				this.getJSON('stages/' + request.params.stageId, function (stage) {
					release();
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
	});

	installHandler('/stage/:stageId', 'put', function (request, response) {
		function sanitizeMap(tileIds) {
			var tiles = {};
			tileIds.forEach(function (id) {
				tiles[id] = true;
			});
			var map = {};
			for (var k in request.query.map) {
				map[k] = {};
				for (var i in request.query.map[k]) {
					map[k][i] = {};
					for (var j in request.query.map[k][i]) {
						var id = parseInt(request.query.map[k][i][j], 10);
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
			for (var i in request.query.instances) {
				var instance = request.query.instances[i];
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
								this.stages.individualWriteLock(request.params.stageId, function (releaseStage) {
									this.getJSON('stages/' + request.params.stageId, function (stage) {
										this.putJSON('stages/' + request.params.stageId, {
											name: stage.name,
											x0: request.query.x0 || stage.x0,
											y0: request.query.y0 || stage.y0,
											map: map,
											instances: instances
										}, function () {
											releaseStage();
											releaseEntities();
											releaseTiles();
											response.json(true);
										});
									});
								});
							} catch (e) {
								releaseEntities();
								releaseTiles();
								response.json(404, e.toString());
							}
						});
					});
				} catch (e) {
					releaseTiles();
					response.json(404, e.toString());
				}
			});
		});
	});

	installHandler('/stage/:stageId', 'delete', function (request, response) {
		this.stages.globalWriteLock(function (releaseStages) {
			this.stages.individualWriteLock(request.params.stageId, function (releaseStage) {
				this.unlink('stages/' + request.params.stageId, function () {
					releaseStage();
					releaseStages();
					response.json(true);
				});
			});
		});
	});
}());
