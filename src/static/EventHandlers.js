function EventHandlers() {
	var handlers = {};
	var triggers = {};
	this.registerHandler = function (id, handler) {
		if (!(id in handlers)) {
			handlers[id] = new MultiSet();
		}
		return handlers[id].add(handler);
	};
	this.registerTrigger = function (id, trigger) {
		if (!(id in triggers)) {
			triggers[id] = new MultiSet();
		}
		return triggers[id].add(trigger);
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
	this.fire = function (id, firer) {
		if (id in handlers) {
			fireSet(handlers[id], firer);
		}
		if (id in triggers) {
			var set = triggers[id];
			delete triggers[id];
			fireSet(set, firer);
		}
	};
	this.fireAll = function (firer) {
		var id;
		for (id in handlers) {
			fireSet(handlers[id], firer);
		}
		for (id in triggers) {
			var set = triggers[id];
			delete triggers[id];
			fireSet(set, firer);
		}
	};
}
