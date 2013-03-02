function CutEntitiesTool() {
	this.mouseup = function (x, y) {
		var instance = Canvace.instances.pick(x, y);
		if (instance !== false) {
			Canvace.entityClipboard.cut(instance);
			Canvace.renderer.render();
		}
	};
}
