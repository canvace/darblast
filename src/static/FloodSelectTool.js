function FloodSelectTool() {
	this.activate = Canvace.selection.show;
	this.deactivate = Canvace.selection.hide;

	var flag = false;
	this.flag = function (on) {
		flag = on;
	};

	this.mouseup = function (x, y) {
		if (!flag) {
			Canvace.selection.dismiss();
		}
		var k = Canvace.layers.getSelected();
		var cell = Canvace.view.getCell(x, y, k);
		Canvace.array.floodLayer(k, cell.i, cell.j, Canvace.selection.addFragment);
	};
}
