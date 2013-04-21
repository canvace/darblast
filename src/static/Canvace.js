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
				var hasData;
				if (arguments.length < 2) {
					hasData = false;
				} else if (arguments.length < 3) {
					if (typeof data !== 'function') {
						hasData = true;
					} else {
						callback = data;
						hasData = false;
					}
				} else {
					hasData = true;
				}
				var settings = {
					url: url,
					method: method,
					success: function (response) {
						callback && callback(JSON.parse(response.responseText));
					},
					failure: function (response) {
						Ext.MessageBox.show({
							title: 'Error',
							msg: JSON.parse(response.responseText).toString(),
							buttons: Ext.MessageBox.OK,
							icon: Ext.MessageBox.ERROR
						});
					}
				};
				if (hasData) {
					if (method !== 'GET') {
						settings.jsonData = data;
					} else {
						settings.params = data;
					}
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

	return thisObject;
}());
