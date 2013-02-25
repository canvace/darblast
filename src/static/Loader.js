function Loader(ready) {
	var tasks = 0;
	var allowReady = false;
	this.queue = function (task, callback) {
		tasks++;
		task(function (response) {
			callback && callback(response);
			if (!--tasks && allowReady) {
				ready();
			}
		});
	};
	this.get = function (url, callback) {
		tasks++;
		Canvace.Ajax.get(url, function (response) {
			callback(response);
			if (!--tasks && allowReady) {
				ready();
			}
		});
	};
	this.allQueued = function () {
		if (!allowReady) {
			allowReady = true;
			if (!tasks) {
				ready();
			}
		}
	};
}
