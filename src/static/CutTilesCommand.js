function CutTilesCommand() {
	this.activate = function () {
		Canvace.tileClipboard.cut();
		Canvace.renderer.render();
	};
}
