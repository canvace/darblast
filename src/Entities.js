installHandler([
	'/entities/',
	'/stages/:stageId/entities/'
], 'get', function (request, response) {
	this.entities.globalReadLock(function (release) {
		this.readdir('entities', function (entries) {
			release();
			response.json(entries);
		});
	});
});

installHandler([
	'/entities/',
	'/stages/:stageId/entities/'
], 'post', function (request, response) {
	this.newIds('entity', function (id) {
		this.entities.globalWriteLock(function (release) {
			var entity = {
				used: false,
				offset: {
					x: 0,
					y: 0
				},
				frames: {},
				frameCounter: 0,
				properties: {}
			};
			this.putJSON('entities/' + id, entity, function () {
				delete entity.frames;
				delete entity.frameCounter;
				delete entity.properties;
				this.broadcast('entities', 'create', {
					id: id,
					descriptor: entity
				});
				release();
				response.json(id);
			});
		});
	});
});

installHandler([
	'/entities/:entityId',
	'/stages/:stageId/entities/:entityId'
], 'get', function (request, response) {
	this.entities.get(request.params.entityId, function (entity) {
		delete entity.frames;
		delete entity.frameCounter;
		delete entity.properties;
		response.json(entity);
	});
});

installHandler([
	'/entities/:entityId',
	'/stages/:stageId/entities/:entityId'
], 'put', function (request) {
	this.entities.modifySync(request.params.entityId, function (entity) {
		if ('offset' in request.body) {
			entity.offset.x = parseFloat(request.body.offset.x);
			entity.offset.x = parseFloat(request.body.offset.x);
		}
		this.broadcast('entities', 'update', {
			id: request.params.entityId,
			descriptor: entity
		});
	});
});

installHandler([
	'/entities/:entityId',
	'/stages/:stageId/entities/:entityId'
], 'delete', function (request, response) {
	this.entities.individualWriteLock(request.params.entityId, function (releaseEntity) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			if (entity.used) {
				releaseEntity();
				response.json(403, 'The specified entity is still in use');
			} else {
				this.entities.globalWriteLock(function (releaseEntities) {
					this.unlink('entities/' + request.params.entityId, function () {
						this.broadcast('entities', 'delete', {
							id: request.params.entityId
						});
						releaseEntities();
						releaseEntity();
						response.json(true);
					});
				});
			}
		});
	});
});

installHandler([
	'/entities/:entityId/frames/',
	'/stages/:stageId/entities/:entityId/frames/'
], 'get', function (request, response) {
	this.entities.get(request.params.entityId, function (entity) {
		var ids = Object.keys(entity.frames);
		ids.sort();
		response.json(ids);
	});
});

installHandler([
	'/entities/:entityId/frames/',
	'/stages/:stageId/entities/:entityId/frames/'
], 'post', function (request, response) {
	var id;
	this.entities.modify(request.params.entityId, function (entity, next) {
		this.refImage(request.body.imageId, function () {
			id = entity.frameCounter++;
			entity.frames[id] = {
				id: request.body.imageId
			};
			if ('duration' in request.body) {
				entity.frames[id].duration = parseInt(request.body.duration, 10);
			}
			var data = {
				id: request.params.entityId,
				frameId: id,
				imageId: request.body.imageId
			};
			if ('duration' in request.body) {
				data.duration = request.body.duration;
			}
			this.broadcast('entities/frames', 'create', data);
			next();
		});
	}, function () {
		response.json(id);
	});
});

installHandler([
	'/entities/:entityId/frames/:frameId',
	'/stages/:stageId/entities/:entityId/frames/:frameId'
], 'get', function (request, response) {
	this.entities.get(request.params.entityId, function (entity) {
		if (request.params.frameId in entity.frames) {
			response.json(entity.frames[request.params.frameId]);
		} else {
			response.json(400, 'Invalid frame ID: ' + request.params.frameId);
		}
	});
});

installHandler([
	'/entities/:entityId/frames/:frameId',
	'/stages/:stageId/entities/:entityId/frames/:frameId'
], 'put', function (request, response) {
	this.entities.individualWriteLock(request.params.entityId, function (release) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			if (request.params.frameId in entity.frames) {
				var duration;
				if (request.body.duration !== false) {
					duration = entity.frames[request.params.frameId].duration = parseInt(request.body.duration, 10);
					this.putJSON('entities/' + request.params.entityId, entity, function () {
						this.broadcast('entities/frames', 'update', {
							id: request.params.entityId,
							frameId: request.params.frameId,
							duration: duration
						});
						release();
						response.json(true);
					});
				} else {
					delete entity.frames[request.params.frameId].duration;
					this.putJSON('entities/' + request.params.entityId, entity, function () {
						this.broadcast('entities/frames', 'update', {
							id: request.params.entityId,
							frameId: request.params.frameId
						});
						release();
						response.json(true);
					});
				}
			} else {
				release();
				response.json(400, 'Invalid frame ID: ' + request.params.frameId);
			}
		});
	});
});

installHandler([
	'/entities/:entityId/frames/:frameId',
	'/stages/:stageId/entities/:entityId/frames/:frameId'
], 'delete', function (request) {
	this.entities.modify(request.params.entityId, function (entity, next) {
		if (request.params.frameId in entity.frames) {
			this.unrefImage(entity.frames[request.params.frameId].id, function () {
				delete entity.frames[request.params.frameId];
				this.broadcast('entities/frames', 'delete', {
					id: request.params.entityId,
					frameId: request.params.frameId
				});
				next();
			});
		} else {
			throw 'Invalid frame ID: ' + request.params.frameId;
		}
	});
});

installHandler([
	'/entities/:entityId/properties/',
	'/stages/:stageId/entities/:entityId/properties/'
], 'get', function (request, response) {
	this.entities.get(request.params.entityId, function (entity) {
		response.json(entity.properties);
	});
});

installHandler([
	'/entities/:entityId/properties/:name',
	'/stages/:stageId/entities/:entityId/properties/:name'
], 'get', function (request, response) {
	this.entities.get(request.params.entityId, function (entity) {
		if (request.params.name in entity.properties) {
			response.json(entity.properties[request.params.name]);
		} else {
			response.json(400, 'Invalid property name: ' + request.params.name);
		}
	});
});

installHandler([
	'/entities/:entityId/properties/:name',
	'/stages/:stageId/entities/:entityId/properties/:name'
], 'put', function (request) {
	this.entities.modifySync(request.params.entityId, function (entity) {
		entity.properties[request.params.name] = request.body.value;
		this.broadcast('entities/properties', 'put', {
			id: request.params.entityId,
			name: request.params.name,
			value: request.body.value
		});
	});
});

installHandler([
	'/entities/:entityId/properties/:name',
	'/stages/:stageId/entities/:entityId/properties/:name'
], 'delete', function (request) {
	this.entities.modifySync(request.params.entityId, function (entity) {
		if (request.params.name in entity.properties) {
			delete entity.properties[request.params.name];
			this.broadcast('entities/properties', 'delete', {
				id: request.params.entityId,
				name: request.params.name
			});
		} else {
			throw 'Invalid property name: ' + request.params.name;
		}
	});
});
