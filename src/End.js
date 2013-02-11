/*global config: false, app: false */

(function (port) {
	if (isFinite(port)) {
		app.listen(port, function () {
			console.log('Canvace Development Environment running on port ' + port);
			require('openurl').open('http://localhost:' + port + '/');
		});
	} else {
		app.listen(80, function () {
			console.log('Canvace Development Environment running on port 80');
			require('openurl').open('http://localhost/');
		});
	}
}(parseInt(config.port, 10)));
