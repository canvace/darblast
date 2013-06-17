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

var path = require('path');
var fs = require('fs');
var util = require('util');
var npm = require('npm');
var MultiSet = require('multiset');
var ReadWriteLock = require('rwlock');
var express = require('express');
var consolidate = require('consolidate');
var http = require('http');

var configDirectory = (function (homeDirectory) {
	var dir;

	dir = homeDirectory;
	if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
		return __dirname;
	}

	dir = path.join(dir, '.Canvace');
	if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
		try {
			fs.mkdirSync(dir);
		} catch (e) {
			return __dirname;
		}
	}

	dir = path.join(dir, 'Darblast');
	if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
		try {
			fs.mkdirSync(dir);
		} catch (e) {
			return __dirname;
		}
	}

	return dir;
}(path.normalize(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'])));

var config = (function () {
	try {
		return require(path.join(configDirectory, 'config.json'));
	} catch (e) {
		return {};
	}
}());

var users = (function () {
	var content;
	try {
		content = fs.readFileSync(path.join(configDirectory, 'users.json'), 'ascii');
	} catch (e) {
		return null;
	}
	try {
		return JSON.parse(content);
	} catch (e) {
		console.log('invalid syntax in users.json');
		process.exit(2);
	}
}());

(function () {
	function showHelp(invalidCommand) {
		if (invalidCommand) {
			console.log('Invalid command. Available commands:');
		} else {
			console.log('Available commands:');
		}
		console.log('');
		console.log('canvace');
		console.log('\tStarts the Canvace Development Environment.');
		console.log('');
		console.log('canvace help');
		console.log('\tShows this screen.');
		console.log('');
		console.log('canvace config port <port>');
		console.log('\tChanges the TCP port number where the Canvace HTTP server listens.');
		console.log('');
		console.log('canvace config browser <bool>');
		console.log('\tEnables or disables the automatic launching of the browser.');
		console.log('');
		console.log('canvace setuser <username> <password>');
		console.log('\tCreates or updates user credentials.');
		console.log('');
		console.log('canvace removeuser <username>');
		console.log('\tRemoves an existing user from Canvace\'s user database.');
		console.log('');
		console.log('canvace clearusers');
		console.log('\tCompletely erases Canvace\'s user database, authentication will not be required any more unless new users are added using setuser.');
		console.log('');
		process.exit(1);
	}
	function requireArguments(count) {
		if (process.argv.length != count) {
			showHelp(true);
		}
	}
	function requireUsers() {
		if (users === null) {
			users = {};
		}
	}
	function storeUsers() {
		fs.writeFileSync(path.join(configDirectory, 'users.json'), JSON.stringify(users), 'ascii');
	}
	if (process.argv.length > 2) {
		switch (process.argv[2]) {
		case 'help':
			showHelp(false);
			break;
		case 'config':
			requireArguments(5);
			if (process.argv[3] !== 'port' && process.argv[3] !== 'browser') {
				showHelp(true);
			} else if (process.argv[3] === 'port') {
				config.port = parseInt(process.argv[4], 10);
				fs.writeFileSync(path.join(configDirectory, 'config.json'), JSON.stringify(config));
			} else {
				config.browser = (process.argv[4] === 'true');
				fs.writeFileSync(path.join(configDirectory, 'config.json'), JSON.stringify(config));
			}
			break;
		case 'setuser':
			requireArguments(5);
			requireUsers();
			users[process.argv[3]] = process.argv[4];
			storeUsers();
			break;
		case 'removeuser':
			requireArguments(4);
			requireUsers();
			delete users[process.argv[3]];
			storeUsers();
			break;
		case 'clearusers':
			requireArguments(3);
			users = null;
			fs.unlinkSync(path.join(configDirectory, 'users.json'));
			break;
		default:
			showHelp(true);
			break;
		}
		process.exit(0);
	}
}());

var newMinorVersion = false;
var newMajorVersion = false;

if (!config.dontCheckForUpdates) {
	if (!('versions' in config)) {
		config.versions = {};
	}
	npm.load(function () {
		npm.commands.view(['canvace', 'versions'], true, function (error, data) {
			var unknownVersions = {};
			for (var key in data) {
				for (var i in data[key].versions) {
					var version = data[key].versions[i];
					if (!(version in config.versions)) {
						config.versions[version] = true;
						unknownVersions[version] = true;
					}
				}
			}
			if (Object.keys(unknownVersions).length) {
				fs.writeFile(path.join(configDirectory, 'config.json'), JSON.stringify(config));
			}
			// TODO compare versions and possibly set newXxxVersion flags
		});
	});
}

var app = express();
app.enable('strict routing');
app.use(express.cookieParser());

if (config.debug) {
	app.use(express.cookieSession({
		secret: 'darblast'
	}));
} else {
	app.use(express.session({
		secret: 'darblast'
	}));
}

app.use(express.static(__dirname + '/static'));

app.use('/directories/root/', function (request, response, next) {
	function normalize(pathToNormalize) {
		return path.normalize(pathToNormalize).replace(path.sep, '/');
	}

	var fullPath = normalize(decodeURIComponent(request.path));
	fs.stat(fullPath, function (error, stats) {
		if (!error && stats.isDirectory()) {
			fs.readdir(fullPath, function (error, entries) {
				if (error) {
					response.send(500, error.toString());
				} else {
					entries = entries.filter(function (name) {
						return !/^\./.test(name);
					});
					var data = [];
					var count = entries.length;
					entries.forEach(function (entry) {
						fs.stat(path.join(fullPath, entry), function (error, stats) {
							if (!error && stats.isDirectory()) {
								data.push({
									id: normalize(path.join('root', fullPath, entry)),
									baseName: entry,
									fullPath: path.normalize(path.join(fullPath, entry)),
									text: entry,
									leaf: false,
									expandable: true,
									expanded: false
								});
							}
							if (!--count) {
								response.json({
									success: true,
									data: data
								});
							}
						});
					});
				}
			});
		} else {
			next();
		}
	});
});

app.use(express.query());
app.use(express.bodyParser());
app.set('views', __dirname + '/views');
app.engine('handlebars', consolidate.handlebars);

if (users !== null) {
	app.use(express.basicAuth(function (username, password) {
		return (username in users) && (users[username] === password);
	}));
}

var server = http.createServer(app);
var io = require('socket.io').listen(server);

if (!config.debug) {
	io.set('log level', 1);
	io.enable('browser client minification');
}

var getProjectId = (function () {
	var projects = {};
	var nextProjectId = 0;
	return function (request) {
		if (!(request.session.projectPath in projects)) {
			projects[request.session.projectPath] = nextProjectId++;
		}
		return projects[request.session.projectPath];
	};
}());
