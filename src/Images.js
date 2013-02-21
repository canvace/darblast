(function () {
	var channel = new PollChannel();

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

	installHandler([
		'/images',
		'/stage/:stageId/images'
	], 'get', function (request, response) {
		this.images.globalReadLock(function (releaseImages) {
			this.readdir('images', function (ids) {
				var labelMap = {};
				var count = ids.length;
				ids.forEach(function (id) {
					this.images.individualReadLock(id, function (releaseImage) {
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

	installHandler([
		'/image/:imageId',
		'/stage/:stageId/image/:imageId'
	], 'get', function (request, response) {
		this.images.individualReadLock(request.params.imageId, function (release) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				this.readFile('images/' + request.params.imageId + '/data', function (data) {
					release();
					response.type(info.type).send(data);
				});
			});
		});
	});

	installHandler([
		'/image/',
		'/stage/:stageId/image/'
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
			this.images.globalWriteLock(function (releaseImages) {
				this.mkdir('images/' + id, function () {
					this.images.individualWriteLock(id, function (releaseImage) {
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
										channel.broadcast({
											method: 'create',
											id: id,
											labels: labels
										});
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

	installHandler([
		'/image/:imageId',
		'/stage/:stageId/image/:imageId'
	], 'put', function (request, response) {
		this.images.individualWriteLock(request.params.imageId, function (release) {
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

	installHandler([
		'/image/:imageId',
		'/stage/:stageId/image/:imageId'
	], 'delete', function (request, response) {
		this.images.individualReadLock(request.params.imageId, function (releaseImage) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				if (info.refCount > 0) {
					releaseImage();
					response.json(403, 'The image is still in use');
				} else {
					this.images.globalWriteLock(function (releaseImages) {
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
		'/poll/image/:pollId',
		'/stage/:stageId/poll/image/:pollId'
	], 'get', function (request, response) {
		request.connection.setKeepAlive(true);
		request.connection.setTimeout(0);
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
