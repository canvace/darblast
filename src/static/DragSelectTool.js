function DragSelectTool() {
	this.activate = Canvace.selection.show;
	this.deactivate = Canvace.selection.hide;

	var flag = false;
	this.flag = function (on) {
		flag = on;
	};

	var x0, y0;
	this.mousedown = function (x, y) {
		if (!flag) {
			Canvace.selection.dismiss();
		}
		Canvace.selection.setCurrentArea(x0 = x, y0 = y, x, y);
		Canvace.renderer.render();
	};
	this.mousedrag = function (x, y) {
		Canvace.selection.setCurrentArea(x0, y0, x, y);
		Canvace.renderer.render();
	};
	this.mouseup = function () {
		Canvace.selection.freezeCurrentArea();
	};
}
