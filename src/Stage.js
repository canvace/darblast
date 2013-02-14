app.get('/stage/:stageId/', function (request, response) {
	response.render('main.handlebars');
});

installJSONHandler('/stage/:stageId', 'get', function () {
	// TODO
});

installJSONHandler('/stage/:stageId/info', 'get', function (request, response) {
	this.getJSON('stages/' + request.params.stageId, function (data) {
		response.json({
			matrix: data.matrix,
			x0: data.x0,
			y0: data.y0
		});
	});
});

installJSONHandler('/stage/', 'post', function (request, response) {
	var projectInfo = this.getJSONSync('info');
	var stageId = projectInfo.stageCounter++;
	this.putJSONSync('info', projectInfo);
	// TODO
});

installJSONHandler('/stage/:stageId', 'put', function () {
	// TODO
});

installJSONHandler('/stage/:stageId', 'delete', function (request, response) {
	this.deleteTreeSync('stages/' + request.params.stageId);
	response.json(true);
});
