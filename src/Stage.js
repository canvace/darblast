app.get('/stage/:stageId/', function (request, response) {
	response.render('main.handlebars');
});

installHandler('/stage/:stageId', 'get', function () {
	// TODO
});

installHandler('/stage/:stageId/info', 'get', function (request, response) {
	this.getJSONLock('stages/' + request.params.stageId, function (data) {
		response.json({
			matrix: data.matrix,
			x0: data.x0,
			y0: data.y0
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
	this.deleteTree('stages/' + request.params.stageId, function () {
		response.json(true);
	});
});
