function Diff(k, array) {
	var diff = {};

	this.put = function (i, j, value) {
		if (!(i in diff)) {
			diff[i] = {};
		}
		if (j in diff[i]) {
			diff[i][j].to = value;
		} else {
			diff[i][j] = {
				from: array[k][i][j],
				to: value
			};
		}
	};
	this.erase = function (i, j) {
		if (!(i in diff)) {
			diff[i] = {};
		}
		if (j in diff[i]) {
			diff[i][j].to = false;
		} else if (j in array[k][i]) {
			diff[i][j] = {
				from: array[k][i][j],
				to: false
			};
		}
	};

	function run(from, to) {
		for (var i in diff) {
			for (var j in diff[i]) {
				if (typeof diff[i][j][from] === 'number') {
					Canvace.buckets.eraseTile(i, j, k);
				}
				if (diff[i][j][to] !== false) {
					if (typeof diff[i][j][to] === 'number') {
						Canvace.buckets.addTile(i, j, k, Canvace.tiles.get(diff[i][j][to]));
					}
					array[k][i][j] = diff[i][j][to];
				} else {
					delete array[k][i][j];
				}
			}
		}
	}

	this.apply = function () {
		run('from', 'to');
	};
	this.reverse = function () {
		run('to', 'from');
	};
}
