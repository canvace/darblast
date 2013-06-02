function EraseTilesTool() {
	this.activate = function () {
		Canvace.cursor
			.snap(true)
			.setTileHighlight()
			.show();
		Canvace.renderer.render();
	};
	this.deactivate = function () {
		Canvace.cursor.hide();
		Canvace.renderer.render();
	};
	var lastCell;
	this.mousedown = function (x, y) {
		lastCell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		Canvace.array.erase(lastCell.i, lastCell.j, lastCell.k);
		Canvace.renderer.render();
	};
	this.mousemove = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.renderer.render();
	};
	this.mousedrag = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		if ((cell.i != lastCell.i) || (cell.j != lastCell.j) || (cell.k != lastCell.k)) {
			lastCell = cell;
			Canvace.array.erase(cell.i, cell.j, cell.k);
			Canvace.renderer.render();
		}
	};
}
