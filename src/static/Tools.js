function Tools() {
	var activeTool = new DragTool();

	new FillSelectionCommand();

	new EraseEntitiesTool();

	new DragSelectTool();
	new FloodSelectTool();

	new CutTilesCommand();
	new CopyTilesCommand();
	new CutEntitiesTool();
	new CopyEntitiesTool();
	new PasteEntityTool();

	var canvas = Ext.get('canvas');
	var down = false;
	canvas.on('mousemove', function (event) {
		if (down) {
			if (activeTool.mousedrag) {
				activeTool.mousedrag(event.getX(), event.getY());
			}
		} else {
			if (activeTool.mousemove) {
				activeTool.mousemove(event.getX(), event.getY());
			}
		}
	});
	canvas.on('mousedown', function (event) {
		down = true;
		if (activeTool.mousedown) {
			activeTool.mousedown(event.getX(), event.getY());
		}
	});
	canvas.on('mouseup', function (event) {
		if (activeTool.mouseup) {
			activeTool.mouseup(event.getX(), event.getY());
		}
		down = false;
	});
}
