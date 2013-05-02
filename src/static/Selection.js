function Selection() {
	function Area() {
		var fragments = {};
		function doAddFragment(i, j) {
			if (!fragments[i]) {
				fragments[i] = {};
			}
			fragments[i][j] = true;
		}
		this.addFragment = function (i, j) {
			var k = Canvace.layers.getSelected();
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
						doAddFragment(i, j);
					}
				}
			} else {
				doAddFragment(i, j);
			}
		};
		this.addFragments = function (otherFragments) {
			for (var i in otherFragments) {
				if (!fragments[i]) {
					fragments[i] = {};
				}
				for (var j in otherFragments[i]) {
					fragments[i][j] = true;
				}
			}
		};
		this.removeFragment = function (i, j) {
			if (i in fragments) {
				delete fragments[i][j];
			}
		};
		this.transfer = function (otherArea) {
			otherArea.addFragments(fragments);
			fragments = {};
		};
		this.clear = function () {
			fragments = {};
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

	var selection = new Area();
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
