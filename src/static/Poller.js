/*global io: false */

function Poller(projectId) {
	var socket = io.connect('/poll/' + projectId);
	socket.on('disconnect', function () {
		Ext.MessageBox.show({
			title: 'Error',
			msg: 'Server connection lost.',
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.ERROR
		});
	});
	this.poll = function (key, method, callback) {
		socket.on(key + '/' + method, callback);
	};
}
