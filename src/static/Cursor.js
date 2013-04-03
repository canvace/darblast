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
