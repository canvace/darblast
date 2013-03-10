/*global config: false, server: false */

(function (port) {
	if (!isFinite(port)) {
		port = 7104;
	}
	server.listen(port, function () {
		console.log('Canvace Development Environment running on port ' + port);
		require('openurl').open('http://localhost:' + port + '/');
	});
}(parseInt(config.port, 10)));
