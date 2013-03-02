function FillSelectionCommand() {
	this.activate = function () {
		var tileId = Canvace.tiles.getSelected();
		if (tileId !== false) {
			Canvace.selection.forEach(function (i, j, k) {
				Canvace.array.set(i, j, k, tileId);
			});
			Canvace.renderer.render();
		}
	};
}
