function Poller() {
	var handlers = {};

	Canvace.Ajax.post('poll', function (id) {
		(function poll() {
			Canvace.Ajax.get('poll/' + id, function (data) {
				if ((data.key in handlers) && (data.method in handlers[data.key])) {
					handlers[data.key][data.method].fastForEach(function (handler) {
						handler(data.parameters);
					});
				}
				poll();
			});
		}());
	});

	this.poll = function (key, method, callback) {
		if (!(key in handlers)) {
			handlers[key] = {};
		}
		if (!(method in handlers[key])) {
			handlers[key][method] = new MultiSet();
		}
		return handlers[key][method].add(callback);
	};
}
