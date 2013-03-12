function StampTileTool() {
	var lastCell = {};
	this.mousedown = function (x, y) {
		var selectedTileId = Canvace.tileControls.getSelectedId();
		if (selectedTileId) {
			lastCell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
			Canvace.array.set(lastCell.i, lastCell.j, lastCell.k, selectedTileId);
			Canvace.renderer.render();
		}
	};
	this.mousedrag = function (x, y) {
		var selectedTileId = Canvace.tileControls.getSelectedId();
		if (selectedTileId) {
			var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
			if ((cell.i != lastCell.i) || (cell.j != lastCell.j)) {
				lastCell = cell;
				Canvace.array.set(cell.i, cell.j, cell.k, selectedTileId);
				Canvace.renderer.render();
			}
		}
	};
}
