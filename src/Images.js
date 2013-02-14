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

	installJSONHandler([
		'/images/all',
		'/stage/:stageId/images/all'
	], 'get', function (request, response) {
		this.readdir('images', function (ids) {
			var labelMap = {};
			var count = ids.length;
			ids.forEach(function (id) {
				this.getJSON('images/' + id + '/info', function (data) {
					labelMap[id] = data.labels;
					if (!--count) {
						response.json(labelMap);
					}
				});
			}, this);
		});
	});

	installJSONHandler([
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'get', function (request, response) {
		response.type(this.getJSONSync('images/' + request.params.imageId + '/info').type);
		response.send(this.readFileSync('images/' + request.params.imageId + '/data'));
	});

	installJSONHandler([
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

		var imageId = (function () {
			var projectInfo = this.getJSONSync('info');
			var imageId = projectInfo.imageCounter;
			projectInfo.imageCounter += util.isArray(request.files.images) ? request.files.images.length : 1;
			this.putJSONSync('info', projectInfo);
			return imageId;
		}());
		var ids = [];

		var handler = this;
		(function (store) {
			if (util.isArray(request.files.images)) {
				for (var i in request.files.images) {
					store(request.files.images[i]);
				}
			} else {
				store(request.files.images);
			}
		}(function (file) {
			handler.mkdirSync('images/' + imageId);
			handler.putJSONSync('images/' + imageId + '/info', {
				refCount: 0,
				type: file.type,
				labels: labels
			});
			handler.writeFileSync('images/' + imageId + '/data', handler.readFileSync(file.path));
			ids.push(imageId++);
		}));

		response.json(ids);
	});

	installJSONHandler([
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'put', function (request, response) {
		this.getJSON('images/' + request.params.imageId + '/info', function (info) {
			info.labels = sanitizeLabels(request.query.labels);
			this.putJSON('images/' + request.params.imageId + '/info', info, function () {
				response.json(true);
			});
		});
	});

	installJSONHandler([
		'/images/:imageId',
		'/stage/:stageId/images/:imageId'
	], 'delete', function (request, response) {
		var path = 'images/' + request.params.imageId;
		if (this.getJSONSync(path + '/info').refCount > 0) {
			response.json(403, 'The image is still in use');
		} else {
			this.deleteTreeSync(path);
			response.json(true);
		}
	});
}());
