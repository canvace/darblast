/*global config: false, server: false */

(function (port) {
	if (isFinite(port)) {
		server.listen(port, function () {
			console.log('Canvace Development Environment running on port ' + port);
			require('openurl').open('http://localhost:' + port + '/');
		});
	} else {
		server.listen(80, function () {
			console.log('Canvace Development Environment running on port 80');
			require('openurl').open('http://localhost/');
		});
	}
}(parseInt(config.port, 10)));
