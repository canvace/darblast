function SessionlessHandler(request, response) {
	var thisObject = this;

	this.realpath = (function () {
		var cache = {};
		return function (path, callback) {
			fs.realpath(path, cache, function (error, path) {
				if (error) {
					response.json(404, error.toString());
				} else {
					try {
						callback.call(thisObject, path);
					} catch (e) {
						response.json(404, e.toString());
					}
				}
			});
		};
	}());

	this.stat = function (path, callback) {
		fs.stat(path, function (error, stat) {
			if (error) {
				response.json(404, error.toString());
			} else {
				try {
					callback.call(thisObject, stat);
				} catch (e) {
					response.json(404, e.toString());
				}
			}
		});
	};

	this.readdir = function (path, callback) {
		fs.readdir(path, function (error, entries) {
			if (error) {
				response.json(404, error.toString());
			} else {
				try {
					callback.call(thisObject, entries);
				} catch (e) {
					response.json(404, e.toString());
				}
			}
		});
	};

	this.mkdir = function (path, callback) {
		fs.mkdir(path, function (error) {
			if (error) {
				response.json(404, error.toString());
			} else {
				try {
					callback.call(thisObject);
				} catch (e) {
					response.json(404, e.toString());
				}
			}
		});
	};

	this.putJSON = function (path, data, callback) {
		fs.writeFile(path, JSON.stringify(data), function (error) {
			if (error) {
				response.json(404, error.toString());
			} else {
				try {
					callback.call(thisObject);
				} catch (e) {
					response.json(404, e.toString());
				}
			}
		});
	};

	this.getProjectId = function () {
		return getProjectId(request);
	};
}

function installSessionlessHandler(urls, method, handler) {
	if (typeof urls === 'string') {
		urls = [urls];
	}
	for (var i in urls) {
		app[method](urls[i], function (request, response) {
			try {
				handler.call(new SessionlessHandler(request, response), request, response);
			} catch (e) {
				response.json(404, e.toString());
			}
		});
	}
}
