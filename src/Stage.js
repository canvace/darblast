app.get('/stage/:stageId/', function (request, response) {
	response.render('main.handlebars');
});

(function () {
	installHandler('/stages', 'get', function (request, response) {
		this.stages.globalReadLock(function (release) {
			this.readdir('stages', function (entries) {
				release();
				response.json(entries);
			});
		});
	});

	installHandler('/stage/', 'post', function () {
		// TODO
	});

	installHandler('/stage/:stageId', 'get', function (request, response) {
		this.getJSON('info', function (project) {
			this.stages.individualReadLock(request.params.stageId, function (release) {
				this.getJSON('stages/' + request.params.stageId, function (stage) {
					release();
					response.json({
						matrix: project.matrix,
						name: stage.name,
						x0: stage.x0,
						y0: stage.y0,
						map: stage.map,
						instances: stage.instances
					});
				});
			});
		});
	});

	installHandler('/stage/:stageId', 'put', function (request, response) {
		var map = {};
		var instances = [];
		// TODO
		this.stages.individualWriteLock('stages/' + request.params.stageId, function (release) {
			this.getJSON('stages/' + request.params.stageId, function (stage) {
				this.putJSON('stages/' + request.params.stageId, {
					name: stage.name,
					x0: request.query.x0 || stage.x0,
					y0: request.query.y0 || stage.y0,
					map: map,
					instances: instances
				}, function () {
					release();
					response.json(true);
				});
			});
		});
	});

	installHandler('/stage/:stageId', 'delete', function (request, response) {
		this.stages.globalWriteLock(function (releaseStages) {
			this.stages.individualWriteLock(request.params.stageId, function (releaseStage) {
				this.unlink('stages/' + request.params.stageId, function () {
					releaseStage();
					releaseStages();
					response.json(true);
				});
			});
		});
	});
}());
