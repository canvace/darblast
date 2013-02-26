/*global io: false */

function Poller(ready) {
	var thisObject = this;

	var socket = io.connect('/poll');
	socket.on('room', function (name) {
		socket.join(name);

		thisObject.poll = function (key, method, callback, scope) {
			if (scope) {
				socket.on(key + '/' + method, function (parameters) {
					callback.call(scope, parameters);
				});
			} else {
				socket.on(key + '/' + method, callback);
			}
		};

		ready();
	});
}
