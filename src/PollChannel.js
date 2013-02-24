var pollChannel = new (function () {
	var channel = new Channel();
	var clients = {};
	var nextClientId = 0;

	installHandler([
		'/poll',
		'/stages/:stageId/poll'
	], 'post', function (request, response) {
		var id = nextClientId++;
		clients[id] = channel.register();
		response.json(id);
	});

	installHandler([
		'/poll/:pollId',
		'/stages/:stageId/poll/:pollId'
	], 'get', function (request, response) {
		request.connection.setKeepAlive(true);
		request.connection.setTimeout(0);
		if (request.params.pollId in clients) {
			clients[request.params.pollId].listen(function (data) {
				response.json(data);
			});
		} else {
			response.json(404, 'Invalid poll ID');
		}
	});

	installHandler([
		'/poll/:pollId',
		'/stages/:stageId/poll/:pollId'
	], 'delete', function (request, response) {
		if (request.params.pollId in clients) {
			clients[request.params.pollId].unregister();
			delete clients[request.params.pollId];
			response.json(true);
		} else {
			response.json(404, 'Invalid poll ID');
		}
	});

	this.broadcast = function (key, method, parameters) {
		channel.broadcast({
			key: key,
			method: method,
			parameters: parameters
		});
	};
})();
