function JSONHandler(request, response) {
	var thisObject = this;

	this.readdir = function (path, callback) {
		fs.readdir(request.session.projectPath + path, function (error, entries) {
			if (error) {
				response.type('json').send(404, error.toString());
			} else {
				callback.call(thisObject, entries);
			}
		});
	};

	this.readdirSync = function (path) {
		return fs.readdirSync(request.session.projectPath + path);
	};

	this.getJSON = function (path, callback) {
		fs.readFile(request.session.projectPath + path, 'ascii', function (error, content) {
			if (error) {
				response.type('json').send(404, error.toString());
			} else {
				var data;
				try {
					data = JSON.parse(content);
				} catch (e) {
					response.type('json').send(404, e.toString());
					return;
				}
				callback.call(thisObject, data);
			}
		});
	};

	this.getJSONSync = function (path) {
		return JSON.parse(fs.readFileSync(request.session.projectPath + path, 'ascii'));
	};

	this.putJSON = function (path, data, callback) {
		fs.writeFile(request.session.projectPath + path, JSON.stringify(data), function (error) {
			if (error) {
				response.type('json').send(404);
			} else {
				callback.call(thisObject);
			}
		});
	};

	this.putJSONSync = function (path, data) {
		fs.writeFileSync(request.session.projectPath + path, JSON.stringify(data), 'ascii');
	};
}

function installJSONHandler(urls, method, handler) {
	if (typeof urls === 'string') {
		urls = [urls];
	}
	for (var i in urls) {
		app[method](urls[i], function (request, response) {
			if (!request.session || !request.session.projectPath) {
				response.type('text').send(400, 'Bad request');
			} else {
				try {
					handler.call(new JSONHandler(request, response), request, response);
				} catch (e) {
					response.type('json').send(404, e.toString());
				}
			}
		});
	}
}
