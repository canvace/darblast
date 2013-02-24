function EventHandlers() {
	var handlers = {};
	var triggers = {};
	this.registerHandler = function (key, handler) {
		if (!(key in handlers)) {
			handlers[key] = new MultiSet();
		}
		return handlers[key].add(handler);
	};
	this.registerTrigger = function (key, trigger) {
		if (!(key in triggers)) {
			triggers[key] = new MultiSet();
		}
		return triggers[key].add(trigger);
	};
	function fireSet(set, firer) {
		if (firer) {
			set.fastForEach(function (handler) {
				firer(handler);
			});
		} else {
			set.fastForEach(function (handler) {
				handler();
			});
		}
	}
	this.fire = function (key, firer) {
		if (key in handlers) {
			fireSet(handlers[key], firer);
		}
		if (key in triggers) {
			var set = triggers[key];
			delete triggers[key];
			fireSet(set, firer);
		}
	};
	this.fireAll = function (firer) {
		var key;
		for (key in handlers) {
			fireSet(handlers[key], firer);
		}
		for (key in triggers) {
			var set = triggers[key];
			delete triggers[key];
			fireSet(set, firer);
		}
	};
}
