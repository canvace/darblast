(function () {
	var channel = new PollChannel();

	function installImageHandler(urls, method, handler) {
		return installCustomHandler(function (request, response) {
			var handler = new Handler(request, response);

			handler.globalReadLock = function (callback) {
				handler.readLock('images', callback);
			};

			handler.globalWriteLock = function (callback) {
				handler.writeLock('images', callback);
			};

			handler.individualReadLock = function (id, callback) {
				handler.readLock('images/' + id, callback);
			};

			handler.individualWriteLock = function (id, callback) {
				handler.writeLock('images/' + id, callback);
			};

			return handler;
		}, urls, method, handler);
	}

	function sanitizeLabels(labels) {
		labels = labels.split(',');
		var label;
		var set = {};
		for (var i in labels) {
			label = labels[i].toString().trim();
			if (label !== '') {
				if (/^[a-zA-Z_\-]+$/.test(label)) {
					set[label] = true;
				} else {
					throw 'One or more labels contain invalid characters';
				}
			}
		}
		var newArray = [];
		for (label in set) {
			newArray.push(label);
		}
		return newArray;
	}

	installImageHandler([
		'/images/all',
		'/stage/:stageId/images/all'
	], 'get', function (request, response) {
		this.globalReadLock(function (releaseImages) {
			this.readdir('images', function (ids) {
				var labelMap = {};
				var count = ids.length;
				ids.forEach(function (id) {
					this.individualReadLock(id, function (releaseImage) {
						this.getJSON('images/' + id + '/info', function (data) {
							releaseImage();
							labelMap[id] = data.labels;
							if (!--count) {
								releaseImages();
								response.json(labelMap);
							}
						});
					});
				}, this);
			});
		});
	});

	installImageHandler([
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'get', function (request, response) {
		this.individualReadLock(request.params.imageId, function (release) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				this.readFile('images/' + request.params.imageId + '/data', function (data) {
					release();
					response.type(info.type).send(data);
				});
			});
		});
	});

	installImageHandler([
		'/images',
		'/stage/:stageId/images'
	], 'post', function (request, response) {
		var labels;
		if ('labels' in request.query) {
			try {
				labels = sanitizeLabels(request.body.labels);
			} catch (e) {
				response.json(400, e.toString());
				return;
			}
		} else {
			labels = [];
		}

		var ids = [];

		function storeImage(file, id, callback) {
			this.globalWriteLock(function (releaseImages) {
				this.mkdir('images/' + id, function () {
					this.individualWriteLock(id, function (releaseImage) {
						releaseImages();
						this.putJSON('images/' + id + '/info', {
							refCount: 0,
							type: file.type,
							labels: labels
						}, function () {
							fs.readFile(file.path, function (error, data) {
								if (error) {
									this.error();
								} else {
									this.writeFile('images/' + id + '/data', data, function () {
										releaseImage();
										ids.push(id);
										callback.call(this);
									});
								}
							});
						});
					});
				});
			});
		}

		function storeImages(imageId) {
			if (util.isArray(request.files.images)) {
				var count = 0;
				for (var i in request.files.images) {
					count++;
					storeImage.call(this, request.files.images[i], imageId++, function () {
						if (!--count) {
							response.json(ids);
						}
					});
				}
			} else {
				storeImage.call(this, request.files.images, imageId, function () {
					response.json([imageId]);
				});
			}
		}

		this.writeLock('info', function (release) {
			this.getJSON('info', function (projectInfo) {
				var firstId = projectInfo.imageCounter;
				projectInfo.imageCounter += util.isArray(request.files.images) ? request.files.images.length : 1;
				this.putJSON('info', projectInfo, function () {
					release();
					storeImages.call(this, firstId);
				});
			});
		});
	});

	installImageHandler([
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'put', function (request, response) {
		this.individualWriteLock(request.params.imageId, function (release) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				info.labels = sanitizeLabels(request.query.labels);
				this.putJSON('images/' + request.params.imageId + '/info', info, function () {
					channel.broadcast({
						method: 'update',
						id: request.params.imageId,
						labels: info.labels
					});
					release();
					response.json(true);
				});
			});
		});
	});

	installImageHandler([
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'delete', function (request, response) {
		this.individualReadLock(request.params.imageId, function (releaseImage) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				if (info.refCount > 0) {
					releaseImage();
					response.json(403, 'The image is still in use');
				} else {
					this.globalWriteLock(function (releaseImages) {
						this.deleteTree('images/' + request.params.imageId, function () {
							channel.broadcast({
								method: 'delete',
								id: request.params.imageId
							});
							releaseImage();
							releaseImages();
							response.json(true);
						});
					});
				}
			});
		});
	});

	installHandler([
		'/poll/image',
		'/stage/:stageId/poll/image'
	], 'post', function (request, response) {
		response.json(channel.createPoll());
	});

	installHandler([
		'/poll/image',
		'/stage/:stageId/poll/image/:pollId'
	], 'get', function (request, response) {
		if (!channel.poll(request.params.pollId, function (data) {
			response.json(data);
		})) {
			response.json(404, 'Invalid poll ID');
		}
	});

	installHandler([
		'/poll/image/:pollId',
		'/stage/:stageId/poll/image/:pollId'
	], 'delete', function (request, response) {
		response.json(channel.deletePoll(request.params.pollId));
	});
}());
