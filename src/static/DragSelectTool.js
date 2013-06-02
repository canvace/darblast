function DragSelectTool() {
	this.activate = function () {
		Canvace.selection.show();
		Canvace.cursor
			.snap(true)
			.setTileHighlight()
			.show();
		Canvace.renderer.render();
	};
	this.deactivate = function () {
		Canvace.cursor.hide();
		Canvace.selection.hide();
		Canvace.renderer.render();
	};

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
	this.mousemove = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.renderer.render();
	};
	this.mousedrag = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.selection.setCurrentArea(x0, y0, x, y);
		Canvace.renderer.render();
	};
	this.mouseup = function () {
		Canvace.selection.freezeCurrentArea();
	};
}
