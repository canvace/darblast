function MultiSet() {
	var elements = {};
	var nextId = 0;
	var count = 0;

	function add(element) {
		var id = nextId++;
		elements[id] = element;
		count++;
		return function () {
			if (elements.hasOwnProperty(id)) {
				delete elements[id];
				count--;
				return true;
			} else {
				return false;
			}
		};
	}

	(function (elements) {
		for (var i in elements) {
			add(elements[i]);
		}
	}(arguments));

	this.add = add;

	this.forEach = function (action) {
		for (var id in elements) {
			if (action(elements[id], (function (id) {
				return function () {
					if (elements.hasOwnProperty(id)) {
						delete elements[id];
						count--;
						return true;
					} else {
						return false;
					}
				};
			}(id))) === false) {
				return true;
			}
		}
		return false;
	};

	this.fastForEach = function (action) {
		for (var id in elements) {
			action(elements[id]);
		}
	};

	this.count = function () {
		return count;
	};

	this.isEmpty = function () {
		return !count;
	};

	this.clear = function () {
		elements = {};
		count = 0;
	};
}
