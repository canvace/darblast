app.get('/stage/:stageId/', function (request, response) {
	response.render('main.handlebars');
});

installJSONHandler('/stage/:stageId', 'get', function () {
	// TODO
});
