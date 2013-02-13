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
], 'post', function () {
	// TODO
});

installJSONHandler([
	'/images/:imageId',
	'/stage/:stageId/images/:imageId'
], 'put', function () {
	// TODO
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
