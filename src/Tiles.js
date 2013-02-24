(function () {
	var broadcaster = new pollChannel.Broadcaster('tiles');
	var frameBroadcaster = new pollChannel.Broadcaster('tiles-frames');

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
	], 'post', function () {
		// TODO
	});

	installHandler([
		'/tiles/:tileId',
		'/stages/:stageId/tiles/:tileId'
	], 'get', function () {
		// TODO
	});

	installHandler([
		'/tiles/:tileId',
		'/stages/:stageId/tiles/:tileId'
	], 'delete', function (request, response) {
		this.tiles.individualWriteLock(request.params.tileId, function (releaseTile) {
			this.getJSON('tiles/' + request.params.tileId, function (tile) {
				if (tile.used) {
					releaseTile();
					response.json(404, 'The specified tile is in use');
				} else {
					this.tiles.globalWriteLock(function (releaseTiles) {
						this.unlink('tiles/' + request.params.tileId, function () {
							releaseTiles();
							releaseTile();
							broadcaster.broadcast('delete', {
								id: request.params.tileId
							});
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
			this.images.individualWriteLock(request.query.imageId, function (releaseImage) {
				this.getJSON('images/' + request.query.imageId + '/info', function (image) {
					image.refCount++;
					this.putJSON('images/' + request.query.imageId + '/info', image, function () {
						releaseImage();
						this.getJSON('tiles/' + request.params.tileId, function (tile) {
							var id = tile.frameCounter++;
							tile.frames[id] = {
								id: request.query.imageId
							};
							if ('duration' in request.query) {
								tile.frames[id].duration = parseInt(request.query.duration, 10);
							}
							this.putJSON('tiles/' + request.params.tileId, tile, function () {
								releaseTile();
								response.json(id);
								var data = {
									tileId: request.params.tileId,
									frameId: id
								};
								if ('duration' in request.query) {
									data.duration = request.query.duration;
								}
								frameBroadcaster.broadcast('create', data);
							});
						});
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
				response.json(tile.frames[request.params.frameId]);
			});
		});
	});

	installHandler([
		'/tiles/:tileId/frames/:frameId',
		'/stages/:stageId/tiles/:tileId/frames/:frameId'
	], 'put', function () {
		// TODO
	});

	installHandler([
		'/tiles/:tileId/frames/:frameId',
		'/stages/:stageId/tiles/:tileId/frames/:frameId'
	], 'delete', function (request, response) {
		this.tiles.individualWriteLock(request.params.tileId, function (releaseTile) {
			this.getJSON('tiles/' + request.params.tileId, function (tile) {
				if (request.params.frameId in tile.frames) {
					var imageId = tile.frames[request.params.frameId].id;
					this.images.individualWriteLock(imageId, function (releaseImage) {
						this.getJSON('images/' + imageId + '/info', function (image) {
							image.refCount--;
							this.putJSON('images/' + imageId + '/info', image, function () {
								releaseImage();
								delete tile.frames[request.params.frameId].id;
								this.putJSON('tiles/' + request.params.tileId, tile, function () {
									releaseTile();
									response.json(true);
									frameBroadcaster.broadcast('delete', {
										tileId: request.params.tileId,
										frameId: request.params.frameId
									});
								});
							});
						});
					});
				} else {
					releaseTile();
					response.json(404, 'Invalid frame ID: ' + request.params.frameId);
				}
			});
		});
	});
}());
