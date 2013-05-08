function Selection() {
	function Area() {
		var fragments = {};

		this.addFragment = function (i, j) {
			function doAddFragment(i, j) {
				if (!fragments[i]) {
					fragments[i] = {};
				}
				if (fragments[i][j]) {
					return false;
				} else {
					return fragments[i][j] = true;
				}
			}
			var k = Canvace.layers.getSelected();
			var diff = {};
			var id = Canvace.array.get(i, j, k);
			if (id !== false) {
				var layout;
				if (typeof id !== 'number') {
					i = id.i;
					j = id.j;
					layout = Canvace.tiles.get(Canvace.array.get(i, j, k)).getLayout();
				} else {
					layout = Canvace.tiles.get(id).getLayout();
				}
				var i0 = i - layout.ref.i;
				var j0 = j - layout.ref.j;
				for (i = i0; i < i0 + layout.span.i; i++) {
					for (j = j0; j < j0 + layout.span.j; j++) {
						if (doAddFragment(i, j)) {
							if (!(i in diff)) {
								diff[i] = {};
							}
							diff[i][j] = true;
						}
					}
				}
				return diff;
			} else {
				if (doAddFragment(i, j)) {
					diff[i] = {};
					diff[i][j] = true;
				}
				return diff;
			}
		};

		this.addFragments = function (otherFragments) {
			var diff = {};
			for (var i in otherFragments) {
				if (!fragments[i]) {
					fragments[i] = {};
				}
				for (var j in otherFragments[i]) {
					if (!fragments[i][j]) {
						fragments[i][j] = true;
						if (!(i in diff)) {
							diff[i] = {};
						}
						diff[i][j] = true;
					}
				}
			}
			return diff;
		};

		this.removeFragments = function (otherFragments) {
			var diff = {};
			for (var i in otherFragments) {
				if (fragments[i]) {
					for (var j in otherFragments[i]) {
						if (fragments[i][j]) {
							delete fragments[i][j];
							if (!(i in diff)) {
								diff[i] = {};
							}
							diff[i][j] = true;
						}
					}
				}
			}
			return diff;
		};

		this.clear = function () {
			var diff = fragments;
			fragments = {};
			return diff;
		};

		this.transfer = function (otherArea) {
			otherArea.addFragments(fragments);
			var diff = fragments;
			fragments = {};
			return diff;
		};

		this.forEach = function (action) {
			var k = Canvace.layers.getSelected();
			for (var i in fragments) {
				i = parseInt(i, 10);
				for (var j in fragments[i]) {
					j = parseInt(j, 10);
					action(i, j, k);
				}
			}
		};
	}

	function RecordedArea() {
		var area = new Area();

		function record(adding, diff) {
			/*jshint unused: false */
			for (var i in diff) {
				if (adding) {
					Canvace.history.record({
						action: function () {
							area.addFragments(diff);
						},
						reverse: function () {
							area.removeFragments(diff);
						}
					});
				} else {
					Canvace.history.record({
						action: function () {
							area.removeFragments(diff);
						},
						reverse: function () {
							area.addFragments(diff);
						}
					});
				}
				return;
			}
		}

		this.addFragment = function (i, j) {
			record(true, area.addFragment(i, j));
		};

		this.addFragments = function (fragments) {
			record(true, area.addFragments(fragments));
		};

		this.clear = function () {
			record(false, area.clear());
		};

		this.forEach = area.forEach;
	}

	var selection = new RecordedArea();
	var currentArea = new Area();
	var show = false;

	this.setCurrentArea = function (x0, y0, x1, y1) {
		var k = Canvace.layers.getSelected();
		var cell0 = Canvace.view.getCell(x0, y0, k);
		var cell1 = Canvace.view.getCell(x1, y1, k);
		var i0 = Math.min(cell0.i, cell1.i);
		var j0 = Math.min(cell0.j, cell1.j);
		var i1 = Math.max(cell0.i, cell1.i);
		var j1 = Math.max(cell0.j, cell1.j);
		currentArea.clear();
		for (var i = i0; i <= i1; i++) {
			for (var j = j0; j <= j1; j++) {
				currentArea.addFragment(i, j);
			}
		}
	};
	this.freezeCurrentArea = function () {
		currentArea.transfer(selection);
	};
	this.dismiss = function () {
		selection.clear();
		currentArea.clear();
	};
	this.addFragment = function (i, j) {
		selection.addFragment(i, j);
	};
	this.forEach = function (action) {
		if (show) {
			selection.forEach(action);
			currentArea.forEach(action);
		}
	};

	this.show = function () {
		show = true;
	};
	this.hide = function () {
		show = false;
	};
}
