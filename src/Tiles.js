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
				used: false,
				offset: {
					x: 0,
					y: 0
				},
				frames: {},
				properties: {}
			};
			tile['static'] = true;
			this.putJSON('tiles/' + id, tile, function () {
				delete tile.frames;
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

installHandler([
	'/tiles/:tileId',
	'/stages/:stageId/tiles/:tileId'
], 'get', function (request, response) {
	this.tiles.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			delete tile.frames;
			delete tile.properties;
			release();
			response.json(tile);
		});
	});
});

installHandler([
	'/tiles/:tileId',
	'/stages/:stageId/tiles/:tileId'
], 'put', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if ('static' in request.body) {
				tile['static'] = !!request.body['static'];
			}
			if ('solid' in request.body) {
				tile.solid = !!request.body.solid;
			}
			if ('offset' in request.body) {
				tile.offset.x = ~~request.body.offset.x;
				tile.offset.x = ~~request.body.offset.x;
			}
			this.putJSON('tiles/' + request.params.tileId, tile, function () {
				delete tile.layout;
				delete tile.frames;
				delete tile.properties;
				this.broadcast('tiles', 'update', {
					id: request.params.tileId,
					descriptor: tile
				});
				release();
				response.json(true);
			});
		});
	});
});

installHandler([
	'/tiles/:tileId',
	'/stages/:stageId/tiles/:tileId'
], 'delete', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (releaseTile) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if (tile.used) {
				releaseTile();
				response.json(400, 'The specified tile is still in use');
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
	this.tiles.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			var ids = Object.keys(tile.frames);
			ids.sort();
			response.json(ids);
		});
	});
});

installHandler([
	'/tiles/:tileId/frames/',
	'/stages/:stageId/tiles/:tileId/frames/'
], 'post', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (releaseTile) {
		this.refImage(request.body.imageId, function () {
			this.getJSON('tiles/' + request.params.tileId, function (tile) {
				var id = tile.frameCounter++;
				tile.frames[id] = {
					id: request.body.imageId
				};
				if ('duration' in request.body) {
					tile.frames[id].duration = parseInt(request.body.duration, 10);
				}
				this.putJSON('tiles/' + request.params.tileId, tile, function () {
					var data = {
						id: request.params.tileId,
						frameId: id
					};
					if ('duration' in request.body) {
						data.duration = request.body.duration;
					}
					this.broadcast('tiles/frames', 'create', data);
					releaseTile();
					response.json(id);
				});
			});
		});
	});
});

installHandler([
	'/tiles/:tileId/frames/:frameId',
	'/stages/:stageId/tiles/:tileId/frames/:frameId'
], 'get', function (request, response) {
	this.tiles.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			if (request.params.frameId in tile.frames) {
				response.json(tile.frames[request.params.frameId]);
			} else {
				response.json(400, 'Invalid frame ID: ' + request.params.frameId);
			}
		});
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
], 'delete', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (releaseTile) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if (request.params.frameId in tile.frames) {
				this.unrefImage(tile.frames[request.params.frameId].id, function () {
					delete tile.frames[request.params.frameId];
					this.putJSON('tiles/' + request.params.tileId, tile, function () {
						this.broadcast('tiles/frames', 'delete', {
							id: request.params.tileId,
							frameId: request.params.frameId
						});
						releaseTile();
						response.json(true);
					});
				});
			} else {
				releaseTile();
				response.json(400, 'Invalid frame ID: ' + request.params.frameId);
			}
		});
	});
});

installHandler([
	'/tiles/:tileId/properties/',
	'/stages/:stageId/tiles/:tileId/properties/'
], 'get', function (request, response) {
	this.tiles.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			response.json(tile.properties);
		});
	});
});

installHandler([
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'get', function (request, response) {
	this.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			if (request.params.name in tile.properties) {
				response.json(tile.properties[request.params.name]);
			} else {
				response.json(400, 'Invalid property name: ' + request.params.name);
			}
		});
	});
});

installHandler([
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'put', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			tile.properties[request.params.name] = request.body.value;
			this.putJSON('tiles/' + request.params.tileId, tile, function () {
				this.broadcast('tiles/properties', 'put', {
					id: request.params.tileId,
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
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'delete', function (request, response) {
	this.individualWriteLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if (request.params.name in tile.properties) {
				delete tile.properties[request.params.name];
				this.putJSON('tiles/' + request.params.tileId, tile, function () {
					this.broadcast('tiles/properties', 'delete', {
						id: request.params.tileId,
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
