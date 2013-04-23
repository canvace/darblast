/*global config: false, server: false */

(function (port) {
	if (!isFinite(port)) {
		port = 7104;
	}
	server.listen(port, function () {
		console.log('Canvace Development Environment running on port ' + port);
		if (!config.hasOwnProperty('browser') || config.browser !== false) {
			require('openurl').open('http://localhost:' + port + '/');
		}
	});
}(parseInt(config.port, 10)));
