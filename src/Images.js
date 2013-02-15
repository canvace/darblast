(function () {
	var util = require('util');

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
		'/images/all',
		'/stage/:stageId/images/all'
	], 'get', function (request, response) {
		this.readLock('images', function (releaseImages) {
			this.readdir('images', function (ids) {
				var labelMap = {};
				var count = ids.length;
				ids.forEach(function (id) {
					this.getJSONLock('images/' + id + '/info', function (data) {
						labelMap[id] = data.labels;
						if (!--count) {
							releaseImages();
							response.json(labelMap);
						}
					});
				}, this);
			});
		});
	});

	installHandler([
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'get', function (request, response) {
		this.readLock('images/' + request.params.imageId, function (release) {
			this.getJSONLock('images/' + request.params.imageId + '/info', function (info) {
				this.readFile('images/' + request.params.imageId + '/data', function (data) {
					release();
					response.type(info.type).send(data);
				});
			});
		});
	});

	installHandler([
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
			this.mkdir('images', id, function () {
				this.writeLock('images/' + id, function (release) {
					this.putJSON('images/' + id + '/info', {
						refCount: 0,
						type: file.type,
						labels: labels
					}, function () {
						fs.readFile(file.path, function (data) {
							this.writeFile('images/' + id + '/data', data);
							release();
							ids.push(id);
							callback();
						});
					});
				});
			});
		}

		function storeImages(imageId) {
			if (util.isArray(request.files.images)) {
				var count = 0;
				this.writeLock('images', function (release) {
					for (var i in request.files.images) {
						count++;
						storeImage.call(this, request.files.images[i], imageId++, function () {
							if (!--count) {
								release();
								response.json(ids);
							}
						});
					}
				});
			} else {
				this.writeLock('images', function (release) {
					storeImage.call(this, request.files.images, imageId, function () {
						release();
						response.json([imageId]);
					});
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
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'put', function (request, response) {
		this.writeLock('images/' + request.params.imageId + '/info', function (release) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				info.labels = sanitizeLabels(request.query.labels);
				this.putJSON('images/' + request.params.imageId + '/info', info, function () {
					release();
					response.json(true);
				});
			});
		});
	});

	installHandler([
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'delete', function (request, response) {
		this.writeLock('images/' + request.params.imageId, function (release) {
			this.getJSONLock('images/' + request.params.imageId + '/info', function (info) {
				release();
				if (info.refCount > 0) {
					response.json(403, 'The image is still in use');
				} else {
					this.deleteTree('images/' + request.params.imageId, function () {
						response.json(true);
					});
				}
			});
		});
	});
}());
