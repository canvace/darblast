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
				offset: {
					x: 0,
					y: 0
				},
				box: {
					i0: 0,
					j0: 0,
					iSpan: 1,
					jSpan: 1
				},
				hasPhysics: false,
				refCount: 0,
				frames: {},
				frameCounter: 0,
				properties: {}
			};
			this.putJSON('entities/' + id, entity, function () {
				delete entity.refCount;
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
		delete entity.refCount;
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
		var descriptor = {};
		if ('offset' in request.body) {
			descriptor.offset = {
				x: entity.offset.x = parseFloat(request.body.offset.x),
				y: entity.offset.y = parseFloat(request.body.offset.y)
			};
		}
		if ('box' in request.body) {
			descriptor.box = entity.box = {
				i0: parseFloat(request.body.box.i0),
				j0: parseFloat(request.body.box.j0),
				iSpan: parseFloat(request.body.box.iSpan),
				jSpan: parseFloat(request.body.box.jSpan)
			};
		}
		if ('hasPhysics' in request.body) {
			descriptor.hasPhysics = entity.hasPhysics = !!request.body.hasPhysics;
		}
		this.broadcast('entities', 'update', {
			id: request.params.entityId,
			descriptor: descriptor
		});
	});
});

installHandler([
	'/entities/:entityId',
	'/stages/:stageId/entities/:entityId'
], 'delete', function (request, response) {
	this.entities.individualReadLock(request.params.entityId, function (releaseEntity) {
		this.getJSON('entities/' + request.params.entityId, function (entity) {
			if (entity.refCount > 0) {
				releaseEntity();
				response.json(400, 'The specified entity is still in use.');
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
		var ids = Object.keys(entity.frames).map(function (id) {
			return parseInt(id, 10);
		});
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
				id: parseInt(request.params.entityId, 10),
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
