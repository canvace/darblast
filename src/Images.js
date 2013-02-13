installJSONHandler('/stage/:stageId/images/all', 'get', function (request, response) {
	var labelMap = {};
	this.readdirSync('images').forEach(function (id) {
		labelMap[id] = this.getJSONSync('images/' + id + '/info').labels;
	});
	response.json(labelMap);
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
