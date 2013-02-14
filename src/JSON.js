function JSONHandler(request, response) {
	var thisObject = this;

	this.readFile = function (path, callback) {
		fs.readFile(request.session.projectPath + path, function (error, data) {
			if (error) {
				response.json(404, error.toString());
			} else {
				callback.call(thisObject, data);
			}
		});
	};

	this.readFileSync = function (path) {
		return fs.readFileSync(request.session.projectPath + path);
	};

	this.unlink = function (path, callback) {
		fs.unlink(request.session.projectPath + path, function (error) {
			if (error) {
				response.json(404, error.toString());
			} else {
				callback.call(thisObject);
			}
		});
	};

	this.unlinkSync = function (path) {
		fs.unlinkSync(path);
	};

	this.readdir = function (path, callback) {
		fs.readdir(request.session.projectPath + path, function (error, entries) {
			if (error) {
				response.json(404, error.toString());
			} else {
				callback.call(thisObject, entries);
			}
		});
	};

	this.readdirSync = function (path) {
		return fs.readdirSync(request.session.projectPath + path);
	};

	this.deleteTree = function (path, callback) {
		(function remove(path, callback) {
			var stat = fs.statSync(path);
			if (stat.isDirectory()) {
				fs.readdir(path, function (entries) {
					var count = entries.length;
					entries.forEach(function (entry) {
						remove(path + '/' + entry, function () {
							if (!--count) {
								fs.rmdir(path, function (error) {
									if (error) {
										response.json(404, error.toString());
									} else {
										callback();
									}
								});
							}
						});
					});
				});
			} else {
				fs.unlink(path, function (error) {
					if (error) {
						response.json(404, error.toString());
					} else {
						callback();
					}
				});
			}
		}(request.session.projectPath + path, callback));
	};

	this.deleteTreeSync = function (path) {
		(function remove(path) {
			if (fs.statSync(path).isDirectory()) {
				fs.readdirSync(path).forEach(function (entry) {
					remove(path + '/' + entry);
				});
				fs.rmdirSync(path);
			} else {
				fs.unlinkSync(path);
			}
		}(request.session.projectPath + path));
	};

	this.getJSON = function (path, callback) {
		fs.readFile(request.session.projectPath + path, 'ascii', function (error, content) {
			if (error) {
				response.json(404, error.toString());
			} else {
				var data;
				try {
					data = JSON.parse(content);
				} catch (e) {
					response.json(404, e.toString());
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
				response.json(404, error.toString());
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
				response.json(400, 'Bad request');
			} else {
				try {
					handler.call(new JSONHandler(request, response), request, response);
				} catch (e) {
					response.json(404, e.toString());
				}
			}
		});
	}
}
