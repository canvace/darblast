function TileClipboard() {
	var tiles = {};
	this.copy = function () {
		tiles = {};
		var k = Canvace.layers.getSelected();
		Canvace.selection.forEach(function (i, j) {
			var entry = Canvace.array.get(i, j, k);
			if (typeof entry === 'number') {
				if (!tiles[i]) {
					tiles[i] = {};
				}
				tiles[i][j] = entry;
			}
		});
	};
	this.cut = function () {
		tiles = {};
		var k = Canvace.layers.getSelected();
		Canvace.selection.forEach(function (i, j) {
			var entry = Canvace.array.get(i, j, k);
			if (typeof entry === 'number') {
				if (!tiles[i]) {
					tiles[i] = {};
				}
				tiles[i][j] = entry;
				Canvace.array.erase(i, j, k);
			}
		});
	};

	function forEach(action) {
		var k = Canvace.layers.getSelected();
		for (var i in tiles) {
			i = parseInt(i, 10);
			for (var j in tiles[i]) {
				j = parseInt(j, 10);
				action(i, j, k, tiles[i][j]);
			}
		}
	}

	this.forEach = forEach;
	this.paste = function (di, dj) {
		forEach(function (i, j, k, id) {
			Canvace.array.set(i + di, j + dj, k, id);
		});
	};
}
