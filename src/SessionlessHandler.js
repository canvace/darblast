/*
 *	Canvace Visual Development Environment, codenamed "Darblast".
 *	Copyright (C) 2013  Canvace Srl  <http://www.canvace.com/>
 *
 *	Dual licensed under the MIT and GPLv3 licenses.
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function SessionlessHandler(request, response) {
	var thisObject = this;

	this.realpath = (function () {
		var cache = {};
		return function (path, callback) {
			fs.realpath(path, cache, function (error, path) {
				if (error) {
					response.json(400, error.toString());
				} else {
					try {
						callback.call(thisObject, path);
					} catch (e) {
						response.json(400, e.toString());
					}
				}
			});
		};
	}());

	this.stat = function (path, callback) {
		fs.stat(path, function (error, stat) {
			if (error) {
				response.json(400, error.toString());
			} else {
				try {
					callback.call(thisObject, stat);
				} catch (e) {
					response.json(400, e.toString());
				}
			}
		});
	};

	this.readdir = function (path, callback) {
		fs.readdir(path, function (error, entries) {
			if (error) {
				response.json(400, error.toString());
			} else {
				try {
					callback.call(thisObject, entries);
				} catch (e) {
					response.json(400, e.toString());
				}
			}
		});
	};

	this.mkdir = function (path, callback) {
		fs.mkdir(path, function (error) {
			if (error) {
				response.json(400, error.toString());
			} else {
				try {
					callback.call(thisObject);
				} catch (e) {
					response.json(400, e.toString());
				}
			}
		});
	};

	this.putJSON = function (path, data, callback) {
		fs.writeFile(path, JSON.stringify(data), function (error) {
			if (error) {
				response.json(400, error.toString());
			} else {
				try {
					callback.call(thisObject);
				} catch (e) {
					response.json(400, e.toString());
				}
			}
		});
	};

	this.createSession = function (projectPath) {
		request.session.projectPath = projectPath;
		io.of('/poll/' + getProjectId(request)).on('connection', function () {});
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
				response.json(400, e.toString());
			}
		});
	}
}
