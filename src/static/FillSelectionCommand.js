function FillSelectionCommand() {
	this.activate = function () {
		var id = Canvace.tiles.getSelectedId();
		if (id !== false) {
			Canvace.history.nest(function () {
				Canvace.selection.forEach(function (i, j, k) {
					Canvace.array.set(i, j, k, id);
				});
			});
			Canvace.renderer.render();
		}
	};
}
