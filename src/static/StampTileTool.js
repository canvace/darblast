function StampTileTool() {
	var unregisterSelectionHandler;

	this.activate = function () {
		Canvace.cursor.snap(true);

		function setCursor(tileId) {
			if (typeof tileId !== 'undefined') {
				var tile = Canvace.tiles.get(tileId);
				if (tile.hasFrames()) {
					var offset = tile.getOffset();
					Canvace.cursor.reset().addElement(
						Canvace.images.getImage(tile.getFirstFrameId()),
						offset.x,
						offset.y
						);
				} else {
					Canvace.cursor.reset();
				}
			}
		}
		setCursor(Canvace.tileControls.getSelectedId());

		unregisterSelectionHandler = Canvace.tileControls.onSelectionChange(function (selectedIds) {
			setCursor(selectedIds[0]);
		});
		Canvace.cursor.show();
		Canvace.renderer.render();
	};
	this.deactivate = function () {
		unregisterSelectionHandler();
		Canvace.cursor.hide();
		Canvace.renderer.render();
	};

	var lastCell = {};

	this.mousedown = function (x, y) {
		var id = Canvace.tileControls.getSelectedId();
		if (typeof id !== 'undefined') {
			lastCell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
			Canvace.array.set(lastCell.i, lastCell.j, lastCell.k, id);
			Canvace.renderer.render();
		}
	};
	this.mousemove = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.renderer.render();
	};
	this.mousedrag = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		var id = Canvace.tileControls.getSelectedId();
		if (typeof id !== 'undefined') {
			var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
			if ((cell.i != lastCell.i) || (cell.j != lastCell.j)) {
				lastCell = cell;
				Canvace.array.set(cell.i, cell.j, cell.k, id);
				Canvace.renderer.render();
			}
		}
	};
}
