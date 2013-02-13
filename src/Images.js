installJSONHandler('/stage/:stageId/images/all', 'get', function (request, response) {
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

installJSONHandler('/stage/:stageId/images/:imageId', 'get', function () {
	// TODO
});

installJSONHandler('/stage/:stageId/images', 'post', function () {
	// TODO
});

installJSONHandler('/stage/:stageId/images/:imageId', 'put', function () {
	// TODO
});
