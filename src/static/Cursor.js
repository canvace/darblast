function Cursor() {
	var thisObject = this;
	var visible = false;
	var snap = true;
	var elements = [];

	var i = 0;
	var j = 0;

	this.show = function () {
		visible = true;
		return thisObject;
	};

	this.hide = function () {
		visible = false;
		return thisObject;
	};

	this.moveToIJ = function (i1, j1) {
		if (snap) {
			i = Math.round(i1);
			j = Math.round(j1);
		} else {
			i = i1;
			j = j1;
		}
	};
	this.moveToXY = function (x, y) {
		var cell = Canvace.view.unproject(x, y, Canvace.layers.getSelected());
		if (snap) {
			i = Math.round(cell[0]);
			j = Math.round(cell[1]);
		} else {
			i = cell[0];
			j = cell[1];
		}
	};

	this.snap = function (on) {
		if (snap = !!on) {
			i = Math.round(i);
			j = Math.round(j);
		}
		return thisObject;
	};

	this.reset = function () {
		elements = [];
		return thisObject;
	};
	this.addElement = function (element, x, y) {
		elements.push({
			element: element,
			x: x,
			y: y
		});
		return thisObject;
	};
	this.setTileHighlight = function () {
		var metrics = Canvace.view.calculateBoxMetrics(1, 1, 0);
		elements = [{
			element: Canvace.view.generateTileHighlight(),
			x: metrics.left,
			y: metrics.top
		}];
		return thisObject;
	};

	this.draw = function (context) {
		if (visible) {
			context.globalAlpha = 0.5;
			var position = Canvace.view.project(i, j, Canvace.layers.getSelected());
			elements.forEach(function (info) {
				context.drawImage(info.element, position[0] + info.x, position[1] + info.y);
			});
			context.globalAlpha = 1;
		}
	};
}
