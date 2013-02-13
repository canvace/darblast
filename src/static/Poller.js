function Poller(type, callback) {
	Canvace.Ajax.post('poll/' + type, function (id) {
		var url = 'poll/' + type + '/' + id;
		(function poll() {
			Canvace.Ajax.get(url, function (data) {
				if (callback(data) !== false) {
					poll();
				} else {
					Canvace.Ajax._delete(url);
				}
			});
		}());
	});
}
