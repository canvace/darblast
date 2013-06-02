function EraseEntitiesTool() {
	this.activate = function () {
		Canvace.cursor
			.snap(false)
			.setTileHighlight()
			.show();
		Canvace.renderer.render();
	};
	this.deactivate = function () {
		Canvace.cursor.hide();
		Canvace.renderer.render();
	};
	this.mousemove = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.renderer.render();
	};
	this.mouseup = function (x, y) {
		var instance = Canvace.instances.pick(x, y);
		if (instance !== false) {
			instance._delete();
		}
	};
}
