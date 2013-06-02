function FloodSelectTool() {
	this.activate = function () {
		Canvace.selection.show();
		Canvace.renderer.render();
	};
	this.deactivate = function () {
		Canvace.selection.hide();
		Canvace.renderer.render();
	};

	var flag = false;
	this.flag = function (on) {
		flag = on;
	};

	this.mouseup = function (x, y) {
		Canvace.history.nest(function () {
			if (!flag) {
				Canvace.selection.dismiss();
			}
			var k = Canvace.layers.getSelected();
			var cell = Canvace.view.getCell(x, y, k);
			Canvace.array.floodLayer(k, cell.i, cell.j, Canvace.selection.addFragment);
		});
		Canvace.renderer.render();
	};
}
