installSessionlessHandler('/', 'post', function (request, response) {
	function chain() {
		var tasks = arguments;
		var handler = this;
		(function start(index) {
			if (index < tasks.length) {
				tasks[index].call(handler, function () {
					start(index + 1);
				});
			}
		}(0));
	}
	if ('path' in request.body) {
		var projectPath = path.normalize(request.body.path);
		var basePath = path.dirname(projectPath);
		var projectName = path.basename(projectPath);
		this.realpath(basePath, function (basePath) {
			var tasks = ['', '/images', '/tiles', '/entities', '/stages'].map(function (path) {
				return function (callback) {
					this.mkdir(basePath + '/' + projectName + path, callback);
				};
			});
			tasks.push(function (callback) {
				this.putJSON(basePath + '/' + projectName + '/info', {
					matrix: [
						[-48, 48, 0],
						[24, 24, -48],
						[1, 1, 1]
					],
					imageCounter: 0,
					tileCounter: 0,
					entityCounter: 0
				}, callback);
			}, function (callback) {
				this.putJSON(basePath + '/' + projectName + '/stages/Stage 1', {
					x0: 0,
					y0: 0,
					map: {},
					marks: {},
					instances: [],
					properties: {}
				}, callback);
			}, function () {
				request.session.projectPath = basePath + '/' + projectName + '/';
				response.json({
					projectId: getProjectId(request),
					stageId: 'Stage 1'
				});
			});
			chain.apply(this, tasks);
		});
	} else {
		response.json(400, 'Missing project path');
	}
});

installSessionlessHandler('/', 'put', function (request, response) {
	this.realpath(path.normalize(request.body.path), function (path) {
		this.stat(path, function (stat) {
			if (stat.isDirectory()) {
				request.session.projectPath = path;
				if (!/[\\\/]$/.test(path)) {
					request.session.projectPath += '/';
				}
				this.readdir(request.session.projectPath + 'stages', function (stages) {
					response.json({
						projectId: getProjectId(request),
						stageId: stages[0]
					});
				});
			} else {
				response.json(404, 'Invalid path');
			}
		});
	});
});

app.get('/update', function (request, response) {
	npm.commands.update(['canvace'], function (error) {
		if (error) {
			response.json(500, error.toString());
		} else {
			response.json(true);
		}
	});
});

app.get('/install', function (request, response) {
	npm.commands.install(['canvace@' + request.query.version], function (error) {
		if (error) {
			response.json(500, error.toString());
		} else {
			response.json(true);
		}
	});
});

app.get('/', function (request, response) {
	if ('projectPath' in request.session) {
		response.render('main.handlebars', {
			projectId: getProjectId(request),
			newMinorVersion: newMinorVersion,
			newMajorVersion: newMajorVersion
		});
	} else {
		response.render('main.handlebars', {
			newMinorVersion: newMinorVersion,
			newMajorVersion: newMajorVersion
		});
	}
});
