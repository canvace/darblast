function WipeTilesCommand() {
	this.activate = function () {
		var k = Canvace.layers.getSelected();
		Canvace.history.nest(function () {
			Canvace.selection.forEach(function (i, j) {
				Canvace.array.erase(i, j, k);
			});
		});
		Canvace.renderer.render();
	};
}
