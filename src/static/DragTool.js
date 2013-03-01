function DragTool() {
	var x0, y0;
	this.mousedown = function (x, y) {
		x0 = x;
		y0 = y;
	};
	this.mousedrag = function (x, y) {
		Canvace.view.drag(x - x0, y - y0);
		x0 = x;
		y0 = y;
		Canvace.renderer.render();
	};
}
