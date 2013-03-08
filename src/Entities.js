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
	this.writeLock('info', function (release) {
		this.getJSON('info', function (project) {
			var id = project.entityCounter++;
			this.putJSON('info', project, function () {
				release();
				this.entities.globalWriteLock(function (release) {
					var entity = {
						used: false,
						hasPhysics: false,
						offset: {
							x: 0,
							y: 0
						},
						frames: [],
						properties: {}
					};
					entity['static'] = true;
					this.putJSON('entities/' + id, entity, function () {
						release();
						response.json(id);
						this.broadcast('entities', 'create', {
							id: id
						});
					});
				});
			});
		});
	});
});

installHandler([
	'/entities/:entityId',
	'/stages/:stageId/entities/:entityId'
], 'get', function (request, response) {
	this.entities.individualReadLock(request.params.entityId, function (release) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			release();
			response.json(entity);
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
				response.json(404, 'The specified entity is in use');
			} else {
				this.entities.globalWriteLock(function (releaseEntities) {
					this.unlink('entities/' + request.params.entityId, function () {
						releaseEntities();
						releaseEntity();
						this.broadcast('entities', 'delete', {
							id: request.params.entityId
						});
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
	this.entities.individualReadLock(request.params.entityId, function (release) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			release();
			var ids = Object.keys(entity.frames);
			ids.sort();
			response.json(ids);
		});
	});
});

installHandler([
	'/entities/:entityId/frames/',
	'/stages/:stageId/entities/:entityId/frames/'
], 'post', function (request, response) {
	this.entities.individualWriteLock(request.params.entityId, function (releaseEntity) {
		this.images.individualWriteLock(request.body.imageId, function (releaseImage) {
			this.getJSON('images/' + request.body.imageId + '/info', function (image) {
				image.refCount++;
				this.putJSON('images/' + request.body.imageId + '/info', image, function () {
					releaseImage();
					this.getJSON('entities/' + request.params.entityId, function (entity) {
						var id = entity.frameCounter++;
						entity.frames[id] = {
							id: request.body.imageId
						};
						if ('duration' in request.body) {
							entity.frames[id].duration = parseInt(request.body.duration, 10);
						}
						this.putJSON('entities/' + request.params.entityId, entity, function () {
							releaseEntity();
							response.json(id);
							var data = {
								id: request.params.entityId,
								frameId: id
							};
							if ('duration' in request.body) {
								data.duration = request.body.duration;
							}
							this.broadcast('entities/frames', 'create', data);
						});
					});
				});
			});
		});
	});
});

installHandler([
	'/entities/:entityId/frames/:frameId',
	'/stages/:stageId/entities/:entityId/frames/:frameId'
], 'get', function (request, response) {
	this.entities.individualReadLock(request.params.entityId, function (release) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			release();
			response.json(entity.frames[request.params.frameId]);
		});
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
				} else {
					delete entity.frames[request.params.frameId].duration;
				}
				this.putJSON('entities/' + request.params.entityId, entity, function () {
					release();
					response.json(true);
					if (request.body.duration !== false) {
						this.broadcast('entities/frames', 'update', {
							id: request.params.entityId,
							frameId: request.params.frameId,
							duration: duration
						});
					} else {
						this.broadcast('entities/frames', 'update', {
							id: request.params.entityId,
							frameId: request.params.frameId
						});
					}
				});
			} else {
				release();
				response.json(404, 'Invalid frame ID: ' + request.params.frameId);
			}
		});
	});
});

installHandler([
	'/entities/:entityId/frames/:frameId',
	'/stages/:stageId/entities/:entityId/frames/:frameId'
], 'delete', function (request, response) {
	this.entities.individualWriteLock(request.params.entityId, function (releaseEntity) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			if (request.params.frameId in entity.frames) {
				var imageId = entity.frames[request.params.frameId].id;
				this.images.individualWriteLock(imageId, function (releaseImage) {
					this.getJSON('images/' + imageId + '/info', function (image) {
						image.refCount--;
						this.putJSON('images/' + imageId + '/info', image, function () {
							releaseImage();
							delete entity.frames[request.params.frameId].id;
							this.putJSON('entities/' + request.params.entityId, entity, function () {
								releaseEntity();
								response.json(true);
								this.broadcast('entities/frames', 'delete', {
									id: request.params.entityId,
									frameId: request.params.frameId
								});
							});
						});
					});
				});
			} else {
				releaseEntity();
				response.json(404, 'Invalid frame ID: ' + request.params.frameId);
			}
		});
	});
});

installHandler([
	'/entities/:entityId/properties/:name',
	'/stages/:stageId/entities/:entityId/properties/:name'
], 'get', function (request, response) {
	this.individualReadLock(request.params.entityId, function (release) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			release();
			response.json(entity.properties[request.params.name]);
		});
	});
});

installHandler([
	'/entities/:entityId/properties/:name',
	'/stages/:stageId/entities/:entityId/properties/:name'
], 'put', function (request, response) {
	this.entities.individualWriteLock(request.params.entityId, function (release) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			entity.properties[request.params.name] = request.body.value;
			this.putJSON('entities/' + request.params.entityId, entity, function () {
				this.broadcast('entities/properties', 'put', {
					id: request.params.entityId,
					name: request.params.name,
					value: request.body.value
				});
				release();
				response.json(true);
			});
		});
	});
});

installHandler([
	'/entities/:entityId/properties/:name',
	'/stages/:stageId/entities/:entityId/properties/:name'
], 'delete', function (request, response) {
	this.individualWriteLock(request.params.entityId, function (release) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			var found = request.params.name in entity.properties;
			if (found) {
				delete entity.properties[request.params.name];
				this.putJSON('entities/' + request.params.entityId, entity, function () {
					this.broadcast('entities/properties', 'delete', {
						id: request.params.entityId,
						name: request.params.name
					});
					release();
					response.json(true);
				});
			} else {
				release();
				response.json(false);
			}
		});
	});
});
