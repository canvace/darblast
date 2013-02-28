/*global io: false */

function Poller(projectId) {
	var socket = io.connect('/poll/' + projectId);
	this.poll = function (key, method, callback) {
		socket.on(key + '/' + method, callback);
	};
}
