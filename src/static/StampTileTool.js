function StampTileTool() {
	var lastCell = {};
	this.mousedown = function (x, y) {
		var id = Canvace.tileControls.getSelectedId();
		if (id) {
			lastCell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
			Canvace.array.set(lastCell.i, lastCell.j, lastCell.k, id);
			Canvace.renderer.render();
		}
	};
	this.mousedrag = function (x, y) {
		var id = Canvace.tileControls.getSelectedId();
		if (id) {
			var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
			if ((cell.i != lastCell.i) || (cell.j != lastCell.j)) {
				lastCell = cell;
				Canvace.array.set(cell.i, cell.j, cell.k, id);
				Canvace.renderer.render();
			}
		}
	};
}
