var express = require('express');
var app = express();

app.use(express.static(__dirname + '/static'));

app.listen(7104, function () {
	require('openurl').open('http://localhost:7104/');
});
