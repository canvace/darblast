var Canvace = (function () {
	var initHandlers = [];
	var thisObject = function (initHandler) {
		initHandlers.push(initHandler);
	};
	thisObject.init = function (components) {
		for (var i in initHandlers) {
			initHandlers[i](components);
		}
	};

	(function () {
		function bindAjax(method) {
			return function (url, data, callback) {
				if (arguments.length < 3) {
					callback = data;
				}
				var settings = {
					url: url,
					method: method,
					success: function (response) {
						callback && callback(JSON.parse(response.responseText));
					}
				};
				if (arguments.length > 2) {
					settings.params = data;
				}
				Ext.Ajax.request(settings);
			};
		}
		thisObject.Ajax = {
			get: bindAjax('GET'),
			post: bindAjax('POST'),
			put: bindAjax('PUT'),
			_delete: bindAjax('DELETE')
		};
	}());

	thisObject.Loader = function (ready) {
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
			thisObject.Ajax.get(url, function (response) {
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
	};

	return thisObject;
}());
