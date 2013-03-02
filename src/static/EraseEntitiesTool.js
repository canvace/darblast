function EraseEntitiesTool() {
	this.mouseup = function (x, y) {
		var instance = Canvace.instances.pick(x, y);
		if (instance !== false) {
			instance._delete();
		}
	};
}
