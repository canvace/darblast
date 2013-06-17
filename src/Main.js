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
						[parseFloat(request.body.matrix11), parseFloat(request.body.matrix12), parseFloat(request.body.matrix13)],
						[parseFloat(request.body.matrix21), parseFloat(request.body.matrix22), parseFloat(request.body.matrix23)],
						[parseFloat(request.body.matrix31), parseFloat(request.body.matrix32), parseFloat(request.body.matrix33)]
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
				this.createSession(basePath + '/' + projectName + '/');
				response.json({
					projectId: this.getProjectId(),
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
				if (!/[\\\/]$/.test(path)) {
					path += '/';
				}
				this.createSession(path);
				this.readdir(request.session.projectPath + 'stages', function (stages) {
					response.cookie('last-path', path.replace(/^\w\:[\\\/]/i, '/').replace(/[\\\/]$/, '').replace(/\\/g, '/'), {
						expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
					}).json({
						projectId: this.getProjectId(),
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

installSessionlessHandler('/', 'get', function (request, response) {
	if ('projectPath' in request.session) {
		this.readdir(request.session.projectPath + 'stages', function (stages) {
			if ('stage' in request.query) {
				var index = stages.indexOf(request.query.stage);
				if (index < 0) {
					// TODO render error page
				} else {
					response.render('main.handlebars', {
						projectId: JSON.stringify(this.getProjectId()),
						stageId: JSON.stringify(stages[index]),
						newMinorVersion: newMinorVersion,
						newMajorVersion: newMajorVersion
					});
				}
			} else {
				// TODO what if the project doesn't have any stages?
				response.render('main.handlebars', {
					projectId: JSON.stringify(this.getProjectId()),
					stageId: JSON.stringify(stages[0]),
					newMinorVersion: newMinorVersion,
					newMajorVersion: newMajorVersion
				});
			}
		});
	} else {
		response.render('main.handlebars', {
			newMinorVersion: newMinorVersion,
			newMajorVersion: newMajorVersion
		});
	}
});
