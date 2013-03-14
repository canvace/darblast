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

		function error(e) {
			removePendingLocks();
			response.json(400, e.toString());
		}

		this.error = error;

		function readLock(path, callback) {
			fileLock.readLock(request.session.projectPath + path, function (e, release) {
				if (e) {
					error(e);
				} else {
					var remove = pendingLocks.add(release);
					try {
						callback.call(thisObject, function () {
							remove();
							release();
						});
					} catch (e) {
						error(e);
					}
				}
			});
		}

		function writeLock(path, callback) {
			fileLock.writeLock(request.session.projectPath + path, function (e, release) {
				if (e) {
					error(e);
				} else {
					var remove = pendingLocks.add(release);
					try {
						callback.call(thisObject, function () {
							remove();
							release();
						});
					} catch (e) {
						error(e);
					}
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
			this.get = function (id, callback) {
				readLock(directory + '/' + id, function (release) {
					thisObject.getJSON(directory + '/' + id, function (object) {
						release();
						callback.call(thisObject, object);
					});
				});
			};
			this.put = function (id, object, broadcast, callback) {
				if (arguments.length < 4) {
					callback = broadcast;
					broadcast = function () {};
				}
				writeLock(directory + '/' + id, function (release) {
					thisObject.putJSON(directory + '/' + id, object, function () {
						broadcast.call(thisObject);
						release();
						callback.call(thisObject);
					});
				});
			};
			this.modify = function (id, modify, broadcast, callback) {
				if (arguments.length < 4) {
					callback = broadcast;
					broadcast = function () {};
				}
				writeLock(directory + '/' + id, function (release) {
					thisObject.getJSON(directory + '/' + id, function (object) {
						modify.call(thisObject, object, function () {
							thisObject.putJSON(directory + '/' + id, object, function () {
								broadcast.call(thisObject);
								release();
								callback.call(thisObject);
							});
						});
					});
				});
			};
			this.modifySync = function (id, modify, broadcast, callback) {
				if (arguments.length < 4) {
					callback = broadcast;
					broadcast = function () {};
				}
				writeLock(directory + '/' + id, function (release) {
					thisObject.getJSON(directory + '/' + id, function (object) {
						modify.call(thisObject, object);
						thisObject.putJSON(directory + '/' + id, object, function () {
							broadcast.call(thisObject);
							release();
							callback.call(thisObject);
						});
					});
				});
			};
		}

		this.stages = new SpecificLocks('stages');
		this.images = new SpecificLocks('images');
		this.tiles = new SpecificLocks('tiles');
		this.entities = new SpecificLocks('entities');

		this.unlink = function (path, callback) {
			fs.unlink(request.session.projectPath + path, function (e) {
				if (e) {
					error(e);
				} else {
					try {
						callback.call(thisObject);
					} catch (e) {
						error(e);
					}
				}
			});
		};

		this.mkdir = function (path, callback) {
			fs.mkdir(request.session.projectPath + path, function (e) {
				if (e) {
					error(e);
				} else {
					try {
						callback.call(thisObject);
					} catch (e) {
						error(e);
					}
				}
			});
		};

		this.readdir = function (path, callback) {
			fs.readdir(request.session.projectPath + path, function (e, entries) {
				if (e) {
					error(e);
				} else {
					try {
						callback.call(thisObject, entries);
					} catch (e) {
						error(e);
					}
				}
			});
		};

		this.deleteTree = function (path, callback) {
			(function remove(path, callback) {
				var stat = fs.statSync(path);
				if (stat.isDirectory()) {
					fs.readdir(path, function (e, entries) {
						if (e) {
							error(e);
						} else {
							var count = entries.length;
							entries.forEach(function (entry) {
								remove(path + '/' + entry, function () {
									if (!--count) {
										fs.rmdir(path, function (e) {
											if (e) {
												error(e);
											} else {
												try {
													callback.call(thisObject);
												} catch (e) {
													error(e);
												}
											}
										});
									}
								});
							});
						}
					});
				} else {
					fs.unlink(path, function (e) {
						if (e) {
							error(e);
						} else {
							try {
								callback.call(thisObject);
							} catch (e) {
								error(e);
							}
						}
					});
				}
			}(request.session.projectPath + path, callback));
		};

		this.realpath = (function () {
			var cache = {};
			return function (path, callback) {
				fs.realpath(path, cache, function (e, path) {
					if (e) {
						error(e);
					} else {
						try {
							callback.call(thisObject, path);
						} catch (e) {
							error(e);
						}
					}
				});
			};
		}());

		this.readFile = function (path, callback) {
			fs.readFile(request.session.projectPath + path, function (e, content) {
				if (e) {
					error(e);
				} else {
					try {
						callback.call(thisObject, content);
					} catch (e) {
						error(e);
					}
				}
			});
		};

		this.writeFile = function (path, data, callback) {
			fs.writeFile(request.session.projectPath + path, data, function (e) {
				if (e) {
					error(e);
				} else {
					try {
						callback.call(thisObject);
					} catch (e) {
						error(e);
					}
				}
			});
		};

		this.getJSON = function (path, callback) {
			fs.readFile(request.session.projectPath + path, 'ascii', function (e, content) {
				if (e) {
					error(e);
				} else {
					try {
						callback.call(thisObject, JSON.parse(content));
					} catch (e) {
						error(e);
					}
				}
			});
		};

		this.putJSON = function (path, data, callback) {
			fs.writeFile(request.session.projectPath + path, JSON.stringify(data), function (e) {
				if (e) {
					error(e);
				} else {
					try {
						callback.call(thisObject);
					} catch (e) {
						error(e);
					}
				}
			});
		};

		this.newIds = function (key, count, callback) {
			if (arguments.length < 3) {
				callback = count;
				count = 1;
			}
			thisObject.writeLock('info', function (release) {
				thisObject.getJSON('info', function (project) {
					var firstId = project[key + 'Counter'];
					project[key + 'Counter'] += count;
					thisObject.putJSON('info', project, function () {
						release();
						callback.call(thisObject, firstId);
					});
				});
			});
		};

		this.refImage = function (id, callback) {
			thisObject.images.individualWriteLock(id, function (release) {
				thisObject.getJSON('images/' + id + '/info', function (image) {
					var count = ++image.refCount;
					thisObject.putJSON('images/' + id + '/info', image, function () {
						release();
						callback.call(thisObject, count);
					});
				});
			});
		};

		this.unrefImage = function (id, callback) {
			thisObject.images.individualWriteLock(id, function (release) {
				thisObject.getJSON('images/' + id + '/info', function (image) {
					var count = --image.refCount;
					thisObject.putJSON('images/' + id + '/info', image, function () {
						release();
						callback.call(thisObject, count);
					});
				});
			});
		};

		this.getProjectId = function () {
			return getProjectId(request);
		};

		this.broadcast = function (key, method, parameters) {
			io.of('/poll/' + getProjectId(request)).emit(key + '/' + method, parameters);
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
					response.json(400, e.toString());
				}
			}
		});
	}
}
