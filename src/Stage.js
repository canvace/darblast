app.get('/stage/:stageId/', function (request, response) {
	response.render('main.handlebars');
});

installHandler('/stage/:stageId', 'get', function () {
	// TODO
});

installHandler('/stage/:stageId/info', 'get', function (request, response) {
	this.getJSON('info', function (projectInfo) {
		this.getJSONLock('stages/' + request.params.stageId, function (stageInfo) {
			response.json({
				matrix: projectInfo.matrix,
				x0: stageInfo.x0,
				y0: stageInfo.y0
			});
		});
	});
});

installHandler('/stage/', 'post', function () {
	// TODO
});

installHandler('/stage/:stageId', 'put', function () {
	// TODO
});

installHandler('/stage/:stageId', 'delete', function (request, response) {
	this.unlink('stages/' + request.params.stageId, function () {
		response.json(true);
	});
});
