var config;
try {
	config = require('./config.json');
} catch (e) {
	config = {};
}

var fs = require('fs');
var path = require('path');
var util = require('util');

var users = (function () {
	var content;
	try {
		content = fs.readFileSync(__dirname + '/users.json', 'ascii');
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
		fs.writeFileSync(__dirname + '/users.json', JSON.stringify(users), 'ascii');
	}
	if (process.argv.length > 2) {
		switch (process.argv[2]) {
		case 'help':
			showHelp(false);
			break;
		case 'config':
			requireArguments(5);
			if (process.argv[3] !== 'port') {
				showHelp(true);
			} else {
				config.port = parseInt(process.argv[4], 10);
				fs.writeFileSync(JSON.stringify(config), 'ascii');
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
			fs.unlinkSync(__dirname + '/users.json');
			break;
		default:
			showHelp(true);
			break;
		}
		process.exit(0);
	}
}());

var MultiSet = require('multiset');
var ReadWriteLock = require('rwlock');
var Channel = require('broadcast');

var express = require('express');
var consolidate = require('consolidate');

var app = express();
app.enable('strict routing');
app.use(express['static'](__dirname + '/static'));
app.use(express.cookieParser());
app.use(express.cookieSession({
	secret: 'darblast'
}));
app.set('views', __dirname + '/views');
app.engine('handlebars', consolidate.handlebars);

if (users !== null) {
	app.use(express.basicAuth(function (username, password) {
		return (username in users) && (users[username] === password);
	}));
}

app.get('/', function (request, response) {

	// FIXME this is temporary
	request.session.projectPath = 'C:/Users/Alberto/Documents/Darblast_NG/projects/test/';

	response.render('main.handlebars');
});
