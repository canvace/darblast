function EraseTilesTool() {
	var lastCell;
	this.mousedown = function (x, y) {
		lastCell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		Canvace.array.erase(lastCell.i, lastCell.j, lastCell.k);
		Canvace.renderer.render();
	};
	this.mousedrag = function (x, y) {
		var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		if ((cell.i != lastCell.i) || (cell.j != lastCell.j) || (cell.k != lastCell.k)) {
			lastCell = cell;
			Canvace.array.erase(cell.i, cell.j, cell.k);
			Canvace.renderer.render();
		}
	};
}
