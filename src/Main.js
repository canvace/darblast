app.post('/', function (request, response) {
	var realpath = (function () {
		var cache = {};
		return function (path, callback) {
			fs.realpath(path, cache, function (error, path) {
				if (error) {
					response.json(404, error.toString());
				} else {
					try {
						callback(path);
					} catch (e) {
						response.json(404, e.toString());
					}
				}
			});
		};
	}());
	function mkdir(path, callback) {
		fs.mkdir(path, function (error) {
			if (error) {
				response.json(404, error.toString());
			} else {
				try {
					callback();
				} catch (e) {
					response.json(404, e.toString());
				}
			}
		});
	}
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
		realpath(basePath, function (basePath) {
			var tasks = ['', '/images', '/tiles', '/entities', '/stages'].map(function (path) {
				return function (callback) {
					mkdir(basePath + '/' + projectName + path, callback);
				};
			});
			tasks.push(function () {
				request.session.projectPath = basePath + '/' + projectName;
				response.json(getProjectId(request));
			});
			chain.apply(this, tasks);
		});
	} else {
		response.json(400, 'Missing project path');
	}
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
