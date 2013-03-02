function PasteEntityTool() {
	this.mouseup = function (x, y) {
		var k = Canvace.layers.getSelected();
		var p = Canvace.view.unproject(x, y, k);
		Canvace.tileClipboard.paste(p[0], p[1], k);
		Canvace.renderer.render();
	};
}
