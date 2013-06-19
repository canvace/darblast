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
	'/tiles/',
	'/stages/:stageId/tiles/'
], 'get', function (request, response) {
	this.tiles.globalReadLock(function (release) {
		this.readdir('tiles', function (entries) {
			release();
			response.json(entries);
		});
	});
});

installHandler([
	'/tiles/',
	'/stages/:stageId/tiles/'
], 'post', function (request, response) {
	this.newIds('tile', function (id) {
		this.tiles.globalWriteLock(function (release) {
			var tile = {
				solid: false,
				static: true,
				layout: {
					ref: {
						i: parseInt(request.body.layout.ref.i, 10),
						j: parseInt(request.body.layout.ref.j, 10)
					},
					span: {
						i: parseInt(request.body.layout.span.i, 10),
						j: parseInt(request.body.layout.span.j, 10)
					}
				},
				offset: {
					x: 0,
					y: 0
				},
				refCount: 0,
				frames: {},
				frameCounter: 0,
				properties: {}
			};
			if ('static' in request.body) {
				tile.static = !!request.body.static;
			}
			if ('solid' in request.body) {
				tile.solid = !!request.body.solid;
			}
			if ('offset' in request.body) {
				tile.offset.x = parseFloat(request.body.offset.x);
				tile.offset.y = parseFloat(request.body.offset.y);
			}
			(function (callback) {
				if ('firstFrameId' in request.body) {
					var imageId = parseInt(request.body.firstFrameId, 10);
					this.refImage(imageId, function () {
						tile.frames[tile.frameCounter++] = {
							id: imageId
						};
						callback.call(this);
					});
				} else {
					callback.call(this);
				}
			}).call(this, function () {
				this.putJSON('tiles/' + id, tile, function () {
					delete tile.refCount;
					delete tile.frames;
					delete tile.frameCounter;
					delete tile.properties;
					this.broadcast('tiles', 'create', {
						id: id,
						descriptor: tile
					});
					release();
					response.json(id);
				});
			});
		});
	});
});

installHandler([
	'/tiles/:tileId',
	'/stages/:stageId/tiles/:tileId'
], 'get', function (request, response) {
	this.tiles.get(request.params.tileId, function (tile) {
		delete tile.refCount;
		delete tile.frames;
		delete tile.frameCounter;
		delete tile.properties;
		response.json(tile);
	});
});

installHandler([
	'/tiles/:tileId',
	'/stages/:stageId/tiles/:tileId'
], 'put', function (request) {
	this.tiles.modifySync(request.params.tileId, function (tile) {
		var descriptor = {};
		if ('static' in request.body) {
			descriptor.static = tile.static = !!request.body.static;
		}
		if ('solid' in request.body) {
			descriptor.solid = tile.solid = !!request.body.solid;
		}
		if ('offset' in request.body) {
			descriptor.offset = {
				x: tile.offset.x = parseFloat(request.body.offset.x),
				y: tile.offset.y = parseFloat(request.body.offset.y)
			};
		}
		this.broadcast('tiles', 'update', {
			id: request.params.tileId,
			descriptor: descriptor
		});
	});
});

installHandler([
	'/tiles/:tileId',
	'/stages/:stageId/tiles/:tileId'
], 'delete', function (request, response) {
	this.tiles.individualReadLock(request.params.tileId, function (releaseTile) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if (tile.refCount > 0) {
				releaseTile();
				response.json(400, 'The specified tile is still in use.');
			} else {
				this.tiles.globalWriteLock(function (releaseTiles) {
					this.unlink('tiles/' + request.params.tileId, function () {
						this.broadcast('tiles', 'delete', {
							id: request.params.tileId
						});
						releaseTiles();
						releaseTile();
						response.json(true);
					});
				});
			}
		});
	});
});

installHandler([
	'/tiles/:tileId/frames/',
	'/stages/:stageId/tiles/:tileId/frames/'
], 'get', function (request, response) {
	this.tiles.get(request.params.tileId, function (tile) {
		var ids = Object.keys(tile.frames).map(function (id) {
			return parseInt(id, 10);
		});
		ids.sort();
		response.json(ids);
	});
});

installHandler([
	'/tiles/:tileId/frames/',
	'/stages/:stageId/tiles/:tileId/frames/'
], 'post', function (request, response) {
	var id;
	this.tiles.modify(request.params.tileId, function (tile, next) {
		this.refImage(request.body.imageId, function () {
			id = tile.frameCounter++;
			tile.frames[id] = {
				id: request.body.imageId
			};
			if ('duration' in request.body) {
				tile.frames[id].duration = parseInt(request.body.duration, 10);
			}
			var data = {
				id: parseInt(request.params.tileId, 10),
				frameId: id,
				imageId: request.body.imageId
			};
			if ('duration' in request.body) {
				data.duration = request.body.duration;
			}
			this.broadcast('tiles/frames', 'create', data);
			next();
		});
	}, function () {
		response.json(id);
	});
});

installHandler([
	'/tiles/:tileId/frames/:frameId',
	'/stages/:stageId/tiles/:tileId/frames/:frameId'
], 'get', function (request, response) {
	this.tiles.get(request.params.tileId, function (tile) {
		if (request.params.frameId in tile.frames) {
			response.json(tile.frames[request.params.frameId]);
		} else {
			response.json(400, 'Invalid frame ID: ' + request.params.frameId);
		}
	});
});

installHandler([
	'/tiles/:tileId/frames/:frameId',
	'/stages/:stageId/tiles/:tileId/frames/:frameId'
], 'put', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if (request.params.frameId in tile.frames) {
				var duration;
				if (request.body.duration !== false) {
					duration = tile.frames[request.params.frameId].duration = parseInt(request.body.duration, 10);
					this.putJSON('tiles/' + request.params.tileId, tile, function () {
						this.broadcast('tiles/frames', 'update', {
							id: request.params.tileId,
							frameId: request.params.frameId,
							duration: duration
						});
						release();
						response.json(true);
					});
				} else {
					delete tile.frames[request.params.frameId].duration;
					this.putJSON('tiles/' + request.params.tileId, tile, function () {
						this.broadcast('tiles/frames', 'update', {
							id: request.params.tileId,
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
	'/tiles/:tileId/frames/:frameId',
	'/stages/:stageId/tiles/:tileId/frames/:frameId'
], 'delete', function (request) {
	this.tiles.modify(request.params.tileId, function (tile, next) {
		if (request.params.frameId in tile.frames) {
			this.unrefImage(tile.frames[request.params.frameId].id, function () {
				delete tile.frames[request.params.frameId];
				this.broadcast('tiles/frames', 'delete', {
					id: request.params.tileId,
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
	'/tiles/:tileId/properties/',
	'/stages/:stageId/tiles/:tileId/properties/'
], 'get', function (request, response) {
	this.tiles.get(request.params.tileId, function (tile) {
		response.json(tile.properties);
	});
});

installHandler([
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'get', function (request, response) {
	this.tiles.get(request.params.tileId, function (tile) {
		if (request.params.name in tile.properties) {
			response.json(tile.properties[request.params.name]);
		} else {
			response.json(400, 'Invalid property name: ' + request.params.name);
		}
	});
});

installHandler([
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'put', function (request) {
	this.tiles.modifySync(request.params.tileId, function (tile) {
		tile.properties[request.params.name] = request.body.value;
		this.broadcast('tiles/properties', 'put', {
			id: request.params.tileId,
			name: request.params.name,
			value: request.body.value
		});
	});
});

installHandler([
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'delete', function (request) {
	this.tiles.modifySync(request.params.tileId, function (tile) {
		if (request.params.name in tile.properties) {
			delete tile.properties[request.params.name];
			this.broadcast('tiles/properties', 'delete', {
				id: request.params.tileId,
				name: request.params.name
			});
		} else {
			throw 'Invalid property name: ' + request.params.name;
		}
	});
});
