function TileArray(map) {
	var array = {};
	var minI = 0, maxI = 0, minJ = 0, maxJ = 0;

	function erase(i, j, k, diff) {
		if (k in array) {
			if (i in array[k]) {
				if (j in array[k][i]) {
					if (typeof array[k][i][j] !== 'number') {
						var ref = array[k][i][j];
						i = ref.i;
						j = ref.j;
					}
					var layout = Canvace.tiles.get(array[k][i][j]).getLayout();
					for (var i1 = i - layout.ref.i; i1 < i - layout.ref.i + layout.span.i; i1++) {
						for (var j1 = j - layout.ref.j; j1 < j - layout.ref.j + layout.span.j; j1++) {
							diff && diff.erase(i1, j1);
							delete array[k][i1][j1];
						}
					}
				}
			}
		}
		Canvace.buckets.eraseTile(i, j, k);
	}

	function put(i, j, k, id, diff) {
		id = parseInt(id, 10);
		if (!(k in array)) {
			array[k] = {};
		}

		function putValue(i, j, value) {
			if (!(i in array[k])) {
				array[k][i] = {};
			}
			if (j in array[k][i]) {
				erase(i, j, k, diff);
			}
			diff && diff.put(i, j, value);
			array[k][i][j] = value;
			minI = Math.min(minI, i);
			maxI = Math.max(maxI, i);
			minJ = Math.min(minJ, j);
			maxJ = Math.max(maxJ, j);
		}

		putValue(i, j, id);
		var tile = Canvace.tiles.get(id);
		var ref = {
			i: i,
			j: j
		};
		var layout = tile.getLayout();
		for (var i1 = i - layout.ref.i; i1 < i - layout.ref.i + layout.span.i; i1++) {
			for (var j1 = j - layout.ref.j; j1 < j - layout.ref.j + layout.span.j; j1++) {
				if ((i != i1) && (j != j1)) {
					putValue(i1, j1, ref);
				}
			}
		}
		Canvace.buckets.addTile(i, j, k, tile);
	}

	for (var k in map) {
		k = parseInt(k, 10);
		for (var i in map[k]) {
			i = parseInt(i, 10);
			for (var j in map[k][i]) {
				j = parseInt(j, 10);
				put(i, j, k, map[k][i][j]);
			}
		}
	}

	Canvace.tiles.onDelete(function (id) {
		var modified = false;
		for (var k in map) {
			k = parseInt(k, 10);
			for (var i in map[k]) {
				i = parseInt(i, 10);
				for (var j in map[k][i]) {
					j = parseInt(j, 10);
					if (map[k][i][j] === id) {
						erase(i, j, k);
						modified = true;
					}
				}
			}
		}
		if (modified) {
			/*
			 * FIXME usability issue: a user loses his entire history as soon as
			 * another one deletes something that's in his modifications.
			 */
			Canvace.history.erase();
		}
	});

	this.get = function (i, j, k) {
		if ((k in array) && (i in array[k]) && (j in array[k][i])) {
			if (typeof array[k][i][j] !== 'number') {
				return Ext.Object.merge({}, array[k][i][j]);
			} else {
				return array[k][i][j];
			}
		} else {
			return false;
		}
	};
	this.getTileCountForLayer = function (k) {
		if (k in array) {
			var count = 0;
			for (var i in array[k]) {
				for (var j in array[k][i]) {
					if (typeof array[k][i][j] === 'number') {
						count++;
					}
				}
			}
			return count;
		} else {
			return 0;
		}
	};

	function record(k, callback) {
		var diff = new Diff(k, array);
		callback(diff);
		Canvace.history.record({
			action: diff.apply,
			reverse: diff.reverse
		});
	}

	this.set = function (i, j, k, id) {
		record(k, function (diff) {
			put(i, j, k, id, diff);
		});
	};
	this.erase = function (i, j, k) {
		record(k, function (diff) {
			erase(i, j, k, diff);
		});
	};
	this.eraseLayer = function (k) {
		if (k in array) {
			record(k, function (diff) {
				for (var i in array[k]) {
					for (var j in array[k][i]) {
						erase(i, j, k, diff);
					}
				}
			});
		}
	};

	this.updateRepositionedTile = function (id) {
		var tile = Canvace.tiles.get(id);
		for (var k in array) {
			k = parseInt(k, 10);
			for (var i in array[k]) {
				i = parseInt(i, 10);
				for (var j in array[k][i]) {
					j = parseInt(j, 10);
					if (array[k][i][j] === id) {
						Canvace.buckets.eraseTile(i, j, k);
						Canvace.buckets.addTile(i, j, k, tile);
					}
				}
			}
		}
	};

	this.forEachLayer = function (action) {
		for (var k in array) {
			action(parseInt(k, 10));
		}
	};
	this.forEach = function (action) {
		for (var k in array) {
			k = parseInt(k, 10);
			for (var i in array[k]) {
				i = parseInt(i, 10);
				for (var j in array[k][i]) {
					j = parseInt(j, 10);
					if (typeof array[k][i][j] === 'number') {
						action(i, j, k, array[k][i][j]);
					}
				}
			}
		}
	};
	this.forEachInLayer = function (k, action) {
		if (k in array) {
			for (var i in array[k]) {
				i = parseInt(i, 10);
				for (var j in array[k][i]) {
					j = parseInt(j, 10);
					if (typeof array[k][i][j] === 'number') {
						action(i, j, array[k][i][j]);
					}
				}
			}
		}
	};
	this.floodLayer = function (k, i, j, action) {
		if (!(k in array)) {
			return;
		}
		function getId(i, j) {
			if ((i in array[k]) && (j in array[k][i])) {
				if (typeof array[k][i][j] !== 'number') {
					return array[k][array[k][i][j].i][array[k][i][j].j];
				} else {
					return array[k][i][j];
				}
			} else {
				return false;
			}
		}
		var map = {};
		var test = function (i, j) {
			if (!(i in map)) {
				map[i] = {};
			}
			if (j in map[i]) {
				return true;
			} else {
				map[i][j] = true;
				return false;
			}
		};
		function createMap(i1, j1, i2, j2) {
			if ((i2 >= minI) && (i2 <= maxI) && (j2 >= minJ) && (j2 <= maxJ)) {
				if ((getId(i1, j1) === getId(i2, j2)) && !test(i2, j2)) {
					createMap(i2, j2, i2 + 1, j2);
					createMap(i2, j2, i2 - 1, j2);
					createMap(i2, j2, i2, j2 + 1);
					createMap(i2, j2, i2, j2 - 1);
				}
			}
		}
		createMap(i, j, i, j);
		(function () {
			for (var i in map) {
				for (var j in map[i]) {
					action(parseInt(i, 10), parseInt(j, 10));
				}
			}
		}());
	};
}
