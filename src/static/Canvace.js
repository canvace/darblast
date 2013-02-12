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
	return thisObject;
}());
