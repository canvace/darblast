function Buckets(width, height) {
	function Bucket() {
		var sections = {};
		var minS = 0, maxS = 0;
		this.add = function (p, k, id) {
			minS = Math.min(minS, p[2]);
			maxS = Math.max(maxS, p[2]);
			if (!sections[p[2]]) {
				sections[p[2]] = new MultiSet();
			}
			return sections[p[2]].add({
				x: p[0],
				y: p[1],
				k: k,
				id: id
			});
		};
		this.forEach = function (action) {
			for (var s = minS; s <= maxS; s++) {
				if (s in sections) {
					sections[s].fastForEach(action);
				}
			}
		};
	}

	var buckets = {};
	var eraser = {};

	function addElement(i, j, k, element) {
		if (!element.hasFrames()) {
			return function () {};
		}
		var p = element.project(i, j, k);
		var id = element.getFirstFrameId();

		var removers = [];
		function addToBucket(i, j) {
			if (!buckets[i]) {
				buckets[i] = {};
			}
			if (!buckets[i][j]) {
				buckets[i][j] = new Bucket();
			}
			removers.push(buckets[i][j].add(p, k, id));
		}

		(function () {
			var i0 = Math.floor(p[1] / height);
			var j0 = Math.floor(p[0] / width);
			addToBucket(i0 - 1, j0 - 1);
			addToBucket(i0 - 1, j0);
			addToBucket(i0, j0 - 1);
			addToBucket(i0, j0);
			var dimensions = element.getDimensions();
			var i1 = Math.floor((p[1] + dimensions.height) / height);
			var j1 = Math.floor((p[0] + dimensions.width) / width);
			if (i1 > i0) {
				addToBucket(i0 + 1, j0 - 1);
				addToBucket(i0 + 1, j0);
			}
			if (j1 > j0) {
				addToBucket(i0 - 1, j0 + 1);
				addToBucket(i0, j0 + 1);
			}
			if ((i1 > i0) && (j1 > j0)) {
				addToBucket(i0 + 1, j0 + 1);
			}
		})();

		return function () {
			for (var index in removers) {
				removers[index]();
			}
			return true;
		};
	}

	this.addTile = function (i, j, k, tile) {
		if (!eraser[k]) {
			eraser[k] = {};
		}
		if (!eraser[k][i]) {
			eraser[k][i] = {};
		}
		eraser[k][i][j] = (function (erase) {
			return function () {
				erase();
				delete eraser[k][i][j];
				return true;
			};
		})(addElement(i, j, k, tile));
	};
	this.eraseTile = function (i, j, k) {
		return eraser[k] && eraser[k][i] && eraser[k][i][j] && eraser[k][i][j]() || false;
	};

	this.addEntity = function (i, j, k, entity) {
		return addElement(i, j, k, entity);
	};

	this.forEach = function (x0, y0, action) {
		var i = Math.floor(-y0 / height);
		if (!buckets[i]) {
			return;
		}
		var j = Math.floor(-x0 / width);
		var bucket = buckets[i][j];
		if (bucket) {
			bucket.forEach(action);
		}
	};
}
