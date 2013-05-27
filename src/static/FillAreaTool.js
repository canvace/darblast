function FillAreaTool() {
	this.mouseup = function (x, y) {
		var id = Canvace.tileControls.getSelectedId();
		if (id) {
			var k = Canvace.layers.getSelected();
			var cell = Canvace.view.getCell(x, y, k);
			Canvace.history.nest(function () {
				Canvace.array.floodLayer(k, cell.i, cell.j, function (i, j) {
					Canvace.array.set(i, j, k, id);
				});
			});
			Canvace.renderer.render();
		}
	};
}
