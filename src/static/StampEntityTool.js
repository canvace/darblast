function StampEntityTool() {
	this.activate = function () {
		var entityId = Canvace.entityControls.getSelectedId();
		if (typeof entityId !== 'undefined') {
			var entity = Canvace.entities.get(entityId);
			if (entity.hasFrames()) {
				var offset = entity.getOffset();
				Canvace.cursor
					.snap(false)
					.reset()
					.addElement(Canvace.images.getImage(entity.getFirstFrameId()), offset.x, offset.y)
					.show();
				Canvace.renderer.render();
			}
		}
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
		var id = Canvace.entityControls.getSelectedId();
		if (id !== false) {
			var k = Canvace.layers.getSelected();
			var p = Canvace.view.unproject(x, y, k);
			Canvace.instances.add(p[0], p[1], k, id);
			Canvace.renderer.render();
		}
	};
}
