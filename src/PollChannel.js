function PollChannel() {
	var channel = new Channel();
	var clients = {};
	var nextClientId = 0;

	this.createPoll = function () {
		var id = nextClientId++;
		clients[id] = channel.register();
		return id;
	};

	this.deletePoll = function (id) {
		if (id in clients) {
			clients[id].unregister();
			delete clients[id];
			return true;
		} else {
			return false;
		}
	};

	this.poll = function (id, callback) {
		if (id in clients) {
			clients[id].listen(callback);
			return true;
		} else {
			return false;
		}
	};

	this.broadcast = channel.broadcast;
}
