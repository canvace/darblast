function MoveEntityTool() {
	var instance = false;
	var k = 0;
	this.mousedown = function (x, y) {
		instance = Canvace.instances.pick(x, y);
		k = Canvace.layers.getSelected();
		if (instance !== false) {
			var p = Canvace.view.unproject(x, y, k);
			instance.setPosition(p[0], p[1], k, true);
			Canvace.renderer.render();
		}
	};
	this.mousedrag = function (x, y) {
		if (instance !== false) {
			var p = Canvace.view.unproject(x, y, k);
			instance.setPosition(p[0], p[1], k, true);
			Canvace.renderer.render();
		}
	};
	this.mouseup = function (x, y) {
		if (instance !== false) {
			var p = Canvace.view.unproject(x, y, k);
			instance.setPosition(p[0], p[1], k, false);
			Canvace.renderer.render();
		}
	};
}
