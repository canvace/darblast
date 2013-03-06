var Handler = (function () {
	var fileLock = new FileLock();
	return function (request, response) {
		var thisObject = this;
		var pendingLocks = new MultiSet();

		function removePendingLocks() {
			pendingLocks.fastForEach(function (release) {
				release();
			});
			pendingLocks.clear();
		}

		this.removePendingLocks = removePendingLocks;

		this.error = function (error) {
			removePendingLocks();
			response.json(404, error.toString());
		};

		function readLock(path, callback) {
			fileLock.readLock(request.session.projectPath + path, function (release) {
				var remove = pendingLocks.add(release);
				try {
					callback.call(thisObject, function () {
						remove();
						release();
					});
				} catch (e) {
					removePendingLocks();
					response.json(404, e.toString());
				}
			});
		}

		function writeLock(path, callback) {
			fileLock.writeLock(request.session.projectPath + path, function (release) {
				var remove = pendingLocks.add(release);
				try {
					callback.call(thisObject, function () {
						remove();
						release();
					});
				} catch (e) {
					removePendingLocks();
					response.json(404, e.toString());
				}
			});
		}

		this.readLock = readLock;
		this.writeLock = writeLock;

		function SpecificLocks(directory) {
			this.globalReadLock = function (callback) {
				readLock(directory, callback);
			};
			this.globalWriteLock = function (callback) {
				writeLock(directory, callback);
			};
			this.individualReadLock = function (id, callback) {
				readLock(directory + '/' + id, callback);
			};
			this.individualWriteLock = function (id, callback) {
				writeLock(directory + '/' + id, callback);
			};
		}

		this.stages = new SpecificLocks('stages');
		this.images = new SpecificLocks('images');
		this.tiles = new SpecificLocks('tiles');
		this.entities = new SpecificLocks('entities');

		this.readFile = function (path, callback) {
			fs.readFile(request.session.projectPath + path, function (error, data) {
				if (error) {
					removePendingLocks();
					response.json(404, error.toString());
				} else {
					try {
						callback.call(thisObject, data);
					} catch (e) {
						removePendingLocks();
						response.json(404, e.toString());
					}
				}
			});
		};

		this.unlink = function (path, callback) {
			fs.unlink(request.session.projectPath + path, function (error) {
				if (error) {
					removePendingLocks();
					response.json(404, error.toString());
				} else {
					try {
						callback.call(thisObject);
					} catch (e) {
						removePendingLocks();
						response.json(404, e.toString());
					}
				}
			});
		};

		this.mkdir = function (path, callback) {
			fs.mkdir(request.session.projectPath + path, function (error) {
				if (error) {
					removePendingLocks();
					response.json(404, error.toString());
				} else {
					try {
						callback.call(thisObject);
					} catch (e) {
						removePendingLocks();
						response.json(404, e.toString());
					}
				}
			});
		};

		this.readdir = function (path, callback) {
			fs.readdir(request.session.projectPath + path, function (error, entries) {
				if (error) {
					removePendingLocks();
					response.json(404, error.toString());
				} else {
					try {
						callback.call(thisObject, entries);
					} catch (e) {
						removePendingLocks();
						response.json(404, e.toString());
					}
				}
			});
		};

		this.deleteTree = function (path, callback) {
			(function remove(path, callback) {
				var stat = fs.statSync(path);
				if (stat.isDirectory()) {
					fs.readdir(path, function (error, entries) {
						if (error) {
							removePendingLocks();
							response.json(404, error.toString());
						} else {
							var count = entries.length;
							entries.forEach(function (entry) {
								remove(path + '/' + entry, function () {
									if (!--count) {
										fs.rmdir(path, function (error) {
											if (error) {
												removePendingLocks();
												response.json(404, error.toString());
											} else {
												try {
													callback.call(thisObject);
												} catch (e) {
													removePendingLocks();
													response.json(404, e.toString());
												}
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
							removePendingLocks();
							response.json(404, error.toString());
						} else {
							try {
								callback.call(thisObject);
							} catch (e) {
								removePendingLocks();
								response.json(404, e.toString());
							}
						}
					});
				}
			}(request.session.projectPath + path, callback));
		};

		this.realPath = (function () {
			var cache = {};
			return function (path, callback) {
				fs.realPath(path, cache, function (error, path) {
					if (error) {
						removePendingLocks();
						response.json(404, error.toString());
					} else {
						try {
							callback.call(thisObject, path);
						} catch (e) {
							removePendingLocks();
							response.json(404, e.toString());
						}
					}
				});
			};
		}());

		this.getJSON = function (path, callback) {
			fs.readFile(request.session.projectPath + path, 'ascii', function (error, content) {
				if (error) {
					removePendingLocks();
					response.json(404, error.toString());
				} else {
					try {
						callback.call(thisObject, JSON.parse(content));
					} catch (e) {
						removePendingLocks();
						response.json(404, e.toString());
					}
				}
			});
		};

		this.putJSON = function (path, data, callback) {
			fs.writeFile(request.session.projectPath + path, JSON.stringify(data), function (error) {
				if (error) {
					removePendingLocks();
					response.json(404, error.toString());
				} else {
					try {
						callback.call(thisObject);
					} catch (e) {
						removePendingLocks();
						response.json(404, e.toString());
					}
				}
			});
		};

		this.getProjectId = function () {
			return getProjectId(request);
		};

		this.broadcast = function (key, method, parameters) {
			io.of('/poll/' + getProjectId()).emit(key + '/' + method, parameters);
		};
	};
}());

function installHandler(urls, method, handler) {
	if (typeof urls === 'string') {
		urls = [urls];
	}
	for (var i in urls) {
		app[method](urls[i], function (request, response) {
			if (!request.session || !request.session.projectPath) {
				response.json(400, 'Invalid request, no stage selected');
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
