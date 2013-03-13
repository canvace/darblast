function StampEntityTool() {
	this.mouseup = function (x, y) {
		var id = Canvace.entityControls.getSelectedId();
		if (id !== false) {
			var k = Canvace.layers.getSelected();
			var p = Canvace.view.unproject(x, y, k);
			Canvace.instances.add(p[0], p[1], k, id);
			Canvace.renderer.render();
		}
	};
}
