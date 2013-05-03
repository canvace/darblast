function Tools() {
	var activeTool;

	function bindCommandHandler(command) {
		return command.activate;
	}

	function bindToolHandler(tool) {
		return function () {
			if (activeTool.deactivate) {
				activeTool.deactivate();
			}
			if ((activeTool = tool).activate) {
				activeTool.activate();
			}
		};
	}

	var toolButtons = [{
		xtype: 'tbseparator'
	}, {
		id: 'undo-button',
		icon: '/resources/images/tools/undo.png',
		tooltip: 'Undo',
		disabled: true,
		handler: bindCommandHandler(new UndoCommand())
	}, {
		id: 'redo-button',
		icon: '/resources/images/tools/redo.png',
		tooltip: 'Redo',
		disabled: true,
		handler: bindCommandHandler(new RedoCommand())
	}, {
		xtype: 'tbseparator'
	}, {
		toggleGroup: 'tool',
		icon: '/resources/images/tools/drag.png',
		tooltip: 'Drag Tool',
		pressed: true,
		handler: bindToolHandler(activeTool = new DragTool())
	}, new ToolGroup('/resources/images/tools/stamp.png', 'Stamp Tools', [{
		text: 'Stamp Tile Tool',
		icon: '/resources/images/tools/stamp_tile.png',
		handler: bindToolHandler(new StampTileTool())
	}, {
		text: 'Stamp Entity Tool',
		icon: '/resources/images/tools/stamp_entity.png',
		handler: bindToolHandler(new StampEntityTool())
	}]), new ToolGroup('/resources/images/tools/fill.png', 'Fill Tools', [{
		text: 'Fill Area Tool',
		icon: '/resources/images/tools/fill_area.png',
		handler: bindToolHandler(new FillAreaTool())
	}, {
		text: 'Fill Selection Command',
		icon: '/resources/images/tools/fill_selection.png',
		handler: bindCommandHandler(new FillSelectionCommand())
	}]), {
		toggleGroup: 'tool',
		icon: '/resources/images/tools/move_entity.png',
		tooltip: 'Move Entity Tool',
		handler: bindToolHandler(new MoveEntityTool())
	}, new ToolGroup('/resources/images/tools/erase.png', 'Erase Tools', [{
		text: 'Erase Tiles Tool',
		icon: '/resources/images/tools/erase_tiles.png',
		handler: bindToolHandler(new EraseTilesTool())
	}, {
		text: 'Erase Entities Tool',
		icon: '/resources/images/tools/erase_entities.png',
		handler: bindToolHandler(new EraseEntitiesTool())
	}, {
		text: 'Wipe Command',
		icon: '/resources/images/tools/wipe_tiles.png',
		handler: bindCommandHandler(new WipeTilesCommand())
	}]), new ToolGroup('/resources/images/tools/select.png', 'Select Tools', [{
		text: 'Drag-Select Tool',
		icon: '/resources/images/tools/drag_select.png',
		handler: bindToolHandler(new DragSelectTool())
	}, {
		text: 'Flood-Select Tool',
		icon: '/resources/images/tools/flood_select.png',
		handler: bindToolHandler(new FloodSelectTool())
	}]), new ToolGroup('/resources/images/tools/clipboard.png', 'Clipboard Tools', [{
		text: 'Cut Tiles Command',
		icon: '/resources/images/tools/cut_tiles.png',
		handler: bindCommandHandler(new CutTilesCommand())
	}, {
		text: 'Copy Tiles Command',
		icon: '/resources/images/tools/copy_tiles.png',
		handler: bindCommandHandler(new CopyTilesCommand())
	}, {
		text: 'Paste Tiles Tool',
		icon: '/resources/images/tools/paste_tiles.png',
		handler: bindToolHandler(new PasteTilesTool())
	}, {
		text: 'Cut Entities Tool',
		icon: '/resources/images/tools/cut_entities.png',
		handler: bindToolHandler(new CutEntitiesTool())
	}, {
		text: 'Copy Entities Tool',
		icon: '/resources/images/tools/copy_entities.png',
		handler: bindToolHandler(new CopyEntitiesTool())
	}, {
		text: 'Paste Entity Tool',
		icon: '/resources/images/tools/paste_entity.png',
		handler: bindToolHandler(new PasteEntityTool())
	}])];

	var canvas = Ext.get('canvas');
	var offset = {
		x: canvas.getX(),
		y: canvas.getY()
	};
	var down = false;
	canvas.on('mousemove', function (event) {
		if (down) {
			if (activeTool.mousedrag) {
				activeTool.mousedrag(event.getX() - offset.x, event.getY() - offset.y);
			}
		} else {
			if (activeTool.mousemove) {
				activeTool.mousemove(event.getX() - offset.x, event.getY() - offset.y);
			}
		}
	});
	canvas.on('mousedown', function (event) {
		down = true;
		if (activeTool.mousedown) {
			activeTool.mousedown(event.getX() - offset.x, event.getY() - offset.y);
		}
	});
	canvas.on('mouseup', function (event) {
		if (activeTool.mouseup) {
			activeTool.mouseup(event.getX() - offset.x, event.getY() - offset.y);
		}
		down = false;
	});

	this.addToolButtons = function () {
		Ext.getCmp('toolbar').add(toolButtons);
	};
}
