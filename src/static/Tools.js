function Tools() {
	var toolButtons = [{
		xtype: 'tbseparator'
	}, {
		icon: '/resources/images/tools/undo.png',
		tooltip: 'Undo',
		disabled: true
	}, {
		icon: '/resources/images/tools/redo.png',
		tooltip: 'Redo',
		disabled: true
	}, {
		xtype: 'tbseparator'
	}, {
		toggleGroup: 'tool',
		icon: '/resources/images/tools/drag.png',
		tooltip: 'Drag Tool',
		pressed: true
	}, new ToolGroup('/resources/images/tools/stamp.png', 'Stamp Tools', [{
		text: 'Stamp Tile Tool',
		icon: '/resources/images/tools/stamp_tile.png'
	}, {
		text: 'Stamp Entity Tool',
		icon: '/resources/images/tools/stamp_entity.png'
	}]), new ToolGroup('/resources/images/tools/fill.png', 'Fill Tools', [{
		text: 'Fill Area Tool',
		icon: '/resources/images/tools/fill_area.png'
	}, {
		text: 'Fill Selection Command',
		icon: '/resources/images/tools/fill_selection.png'
	}]), {
		toggleGroup: 'tool',
		icon: '/resources/images/tools/move_entity.png',
		tooltip: 'Move Entity Tool'
	}, new ToolGroup('/resources/images/tools/erase.png', 'Erase Tools', [{
		text: 'Erase Tiles Tool',
		icon: '/resources/images/tools/erase_tiles.png'
	}, {
		text: 'Erase Entities Tool',
		icon: '/resources/images/tools/erase_entities.png'
	}, {
		text: 'Wipe Command',
		icon: '/resources/images/tools/wipe_tiles.png'
	}]), new ToolGroup('/resources/images/tools/select.png', 'Select Tools', [{
		text: 'Drag-Select Tool',
		icon: '/resources/images/tools/drag_select.png'
	}, {
		text: 'Flood-Select Tool',
		icon: '/resources/images/tools/flood_select.png'
	}]), new ToolGroup('/resources/images/tools/clipboard.png', 'Clipboard Tools', [{
		text: 'Cut Tiles Command',
		icon: '/resources/images/tools/cut_tiles.png'
	}, {
		text: 'Copy Tiles Command',
		icon: '/resources/images/tools/copy_tiles.png'
	}, {
		text: 'Paste Tiles Tool',
		icon: '/resources/images/tools/paste_tiles.png'
	}, {
		text: 'Cut Entities Tool',
		icon: '/resources/images/tools/cut_entities.png'
	}, {
		text: 'Copy Entities Tool',
		icon: '/resources/images/tools/copy_entities.png'
	}, {
		text: 'Paste Entities Tool',
		icon: '/resources/images/tools/paste_entity.png'
	}])];

	new UndoCommand();
	new RedoCommand();

	var activeTool = new DragTool();

	new FillSelectionCommand();

	new EraseEntitiesTool();

	new DragSelectTool();
	new StampTileTool();
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

	this.addToolButtons = function () {
		Ext.getCmp('toolbar').add(toolButtons);
	};
}
