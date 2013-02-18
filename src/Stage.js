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

	installStageHandler('/stage/:stageId', 'get', function (request, response) {
		this.individualReadLock(request.params.stageId, function (release) {
			this.getJSON('stages/' + request.params.stageId, function (data) {
				release();
				response.json({
					map: data.map,
					instances: data.instances
				});
			});
		});
	});

	installStageHandler('/stage/:stageId/info', 'get', function (request, response) {
		this.readLock('info', function (releaseProject) {
			this.getJSON('info', function (projectInfo) {
				releaseProject();
				this.getJSON('stages/' + request.params.stageId, function (stageInfo) {
					response.json({
						matrix: projectInfo.matrix,
						x0: stageInfo.x0,
						y0: stageInfo.y0
					});
				});
			});
		});
	});

	installStageHandler('/stage/', 'post', function () {
		// TODO
	});

	installStageHandler('/stage/:stageId', 'put', function () {
		// TODO
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
