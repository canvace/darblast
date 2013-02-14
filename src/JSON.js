function JSONHandler(request, response) {
	var thisObject = this;

	this.readFile = function (path, callback) {
		fileLock.readLock(request.session.projectPath + path, function (release) {
			fs.readFile(request.session.projectPath + path, function (error, data) {
				release();
				if (error) {
					response.json(404, error.toString());
				} else {
					callback.call(thisObject, data);
				}
			});
		});
	};

	this.readFileSync = function (path) {
		return fs.readFileSync(request.session.projectPath + path);
	};

	this.unlink = function (path, callback) {
		fileLock.writeLock(request.session.projectPath + path, function (release) {
			fs.unlink(request.session.projectPath + path, function (error) {
				release();
				if (error) {
					response.json(404, error.toString());
				} else {
					callback.call(thisObject);
				}
			});
		});
	};

	this.unlinkSync = function (path) {
		fs.unlinkSync(path);
	};

	this.readdir = function (path, callback) {
		fileLock.readLock(request.session.projectPath + path, function (release) {
			fs.readdir(request.session.projectPath + path, function (error, entries) {
				release();
				if (error) {
					response.json(404, error.toString());
				} else {
					callback.call(thisObject, entries);
				}
			});
		});
	};

	this.readdirSync = function (path) {
		return fs.readdirSync(request.session.projectPath + path);
	};

	this.deleteTree = function (path, callback) {
		(function remove(path, callback) {
			fileLock.writeLock(path, function (release) {
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
											release();
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
						release();
						if (error) {
							response.json(404, error.toString());
						} else {
							callback.call(thisObject);
						}
					});
				}
			});
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
		fileLock.readLock(request.session.projectPath + path, function (release) {
			fs.readFile(request.session.projectPath + path, 'ascii', function (error, content) {
				release();
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
		});
	};

	this.getJSONSync = function (path) {
		return JSON.parse(fs.readFileSync(request.session.projectPath + path, 'ascii'));
	};

	this.putJSON = function (path, data, callback) {
		fileLock.writeLock(request.session.projectPath + path, function (release) {
			fs.writeFile(request.session.projectPath + path, JSON.stringify(data), function (error) {
				release();
				if (error) {
					response.json(404, error.toString());
				} else {
					callback.call(thisObject);
				}
			});
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
