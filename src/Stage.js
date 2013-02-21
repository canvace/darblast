app.get('/stage/:stageId/', function (request, response) {
	response.render('main.handlebars');
});

(function () {
	function installStageHandler(urls, method, handler) {
		return installCustomHandler(function (request, response) {
			var handler = new Handler(request, response);

			handler.globalReadLock = function (callback) {
				handler.readLock('stages', callback);
			};

			handler.globalWriteLock = function (callback) {
				handler.writeLock('stages', callback);
			};

			handler.individualReadLock = function (id, callback) {
				handler.readLock('stages/' + id, callback);
			};

			handler.individualWriteLock = function (id, callback) {
				handler.writeLock('stages/' + id, callback);
			};

			return handler;
		}, urls, method, handler);
	}

	installStageHandler('/stages', 'get', function (request, response) {
		this.globalReadLock(function (release) {
			this.readdir('stages', function (entries) {
				release();
				response.json(entries);
			});
		});
	});

	installStageHandler('/stage/', 'post', function () {
		// TODO
	});

	installStageHandler('/stage/:stageId', 'get', function (request, response) {
		this.getJSON('info', function (project) {
			this.individualReadLock(request.params.stageId, function (release) {
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

	installStageHandler('/stage/:stageId', 'put', function (request, response) {
		var map = {};
		var instances = [];
		// TODO
		this.individualWriteLock('stages/' + request.params.stageId, function (release) {
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

	installStageHandler('/stage/:stageId', 'delete', function (request, response) {
		this.globalWriteLock(function (releaseStages) {
			this.individualWriteLock(request.params.stageId, function (releaseStage) {
				this.unlink('stages/' + request.params.stageId, function () {
					releaseStage();
					releaseStages();
					response.json(true);
				});
			});
		});
	});
}());
