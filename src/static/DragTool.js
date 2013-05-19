function DragTool() {
	var origin;
	var x0, y0;
	this.mousedown = function (x, y) {
		origin = Canvace.view.getOrigin();
		x0 = x;
		y0 = y;
	};
	this.mousedrag = function (x, y) {
		Canvace.view.dragBy(x - x0, y - y0);
		x0 = x;
		y0 = y;
		Canvace.renderer.render();
	};
	this.mouseup = function () {
		(function (o0, o1) {
			if ((o0.x != o1.x) || (o0.y != o1.y)) {
				Canvace.history.record({
					action: function () {
						Canvace.view.dragTo(o1.x, o1.y);
						Canvace.renderer.render();
					},
					reverse: function () {
						Canvace.view.dragTo(o0.x, o0.y);
						Canvace.renderer.render();
					}
				});
			}
		}(origin, Canvace.view.getOrigin()));
	};
}
