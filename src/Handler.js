function Handler(request, response) {
	var thisObject = this;

	this.readLock = function (path, callback) {
		fileLock.readLock(request.session.projectPath + path, callback);
	};

	this.writeLock = function (path, callback) {
		fileLock.writeLock(request.session.projectPath + path, callback);
	};

	this.readFile = function (path, callback) {
		fs.readFile(request.session.projectPath + path, function (error, data) {
			if (error) {
				response.json(404, error.toString());
			} else {
				callback.call(thisObject, data);
			}
		});
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

	this.mkdir = function (path, name, callback) {
		fs.mkdir(request.session.projectPath + path + '/' + name, function (error) {
			if (error) {
				response.json(404, error.toString());
			} else {
				callback.call(thisObject);
			}
		});
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

	this.deleteTree = function (path, callback) {
		(function remove(path, callback) {
			var stat = fs.statSync(path);
			if (stat.isDirectory()) {
				fs.readdir(path, function (error, entries) {
					if (error) {
						response.json(404, error.toString());
					} else {
						var count = entries.length;
						entries.forEach(function (entry) {
							remove(path + '/' + entry, function () {
								if (!--count) {
									fs.rmdir(path, function (error) {
										if (error) {
											response.json(404, error.toString());
										} else {
											callback.call(thisObject);
										}
									});
								}
							});
						});
					}
				});
			} else {
				fs.unlink(path, function (error) {
					if (error) {
						response.json(404, error.toString());
					} else {
						callback.call(thisObject);
					}
				});
			}
		}(request.session.projectPath + path, callback));
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

	this.putJSON = function (path, data, callback) {
		fs.writeFile(request.session.projectPath + path, JSON.stringify(data), function (error) {
			if (error) {
				response.json(404, error.toString());
			} else {
				callback.call(thisObject);
			}
		});
	};
}

function installHandler(Handler, urls, method, handler) {
	if (typeof urls === 'string') {
		urls = [urls];
	}
	for (var i in urls) {
		app[method](urls[i], function (request, response) {
			if (!request.session || !request.session.projectPath) {
				response.json(400, 'Bad request');
			} else {
				try {
					handler.call(new Handler(request, response), request, response);
				} catch (e) {
					response.json(404, e.toString());
				}
			}
		});
	}
}
