/*
 *	Canvace Visual Development Environment, codenamed "Darblast".
 *	Copyright (C) 2013  Canvace Srl  <http://www.canvace.com/>
 *
 *	Dual licensed under the MIT and GPLv3 licenses.
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*global KeyEvent: false */

function Toolbar() {
	var activeTool, dragTool, pasteTilesTool;
	var undoCommand, redoCommand, copyTilesCommand, cutTilesCommand;

	function switchTool(newTool) {
		if (activeTool.deactivate) {
			activeTool.deactivate();
		}
		var previousTool = activeTool;
		if ((activeTool = newTool).activate) {
			activeTool.activate();
		}
		return previousTool;
	}

	function bindCommandHandler(command) {
		return command.activate;
	}

	function bindToolHandler(tool) {
		return function () {
			switchTool(tool);
		};
	}

	function doSave() {
		var origin = Canvace.view.getOrigin();
		var map = {};
		Canvace.array.forEach(function (i, j, k, id) {
			if (!(k in map)) {
				map[k] = {};
			}
			if (!(i in map[k])) {
				map[k][i] = {};
			}
			map[k][i][j] = id;
		});
		var instances = [];
		Canvace.instances.forEach(function (instance) {
			var position = instance.getPosition();
			instances.push({
				id: instance.getEntity().getId(),
				i: position.i,
				j: position.j,
				k: position.k,
				properties: {} // FIXME instance properties not implemented
			});
		});
		Canvace.Ajax.put('/stages/' + Canvace.stages.getCurrent().getId(), {
			x0: origin.x,
			y0: origin.y,
			map: map,
			instances: instances
		}, Canvace.history.clearDirty);
	}

	var toolButtons = [{
		icon: '/resources/images/tools/save.png',
		tooltip: 'Save',
		handler: doSave
	}, {
		icon: '/resources/images/tools/full.png',
		tooltip: 'Full rendering...',
		handler: function () {
			new FullRendering();
		}
	}, {
		icon: '/resources/images/tools/export.png',
		tooltip: 'Export...',
		handler: function () {
			new ExportWizard();
		}
	}, {
		icon: '/resources/images/tools/bug.png',
		tooltip: 'Report a bug...',
		handler: function () {
			window.open('//github.com/canvace/darblast/issues');
		}
	},  {
		xtype: 'tbseparator'
	}, {
		id: 'undo-button',
		icon: '/resources/images/tools/undo.png',
		tooltip: 'Undo',
		disabled: true,
		handler: bindCommandHandler(undoCommand = new UndoCommand())
	}, {
		id: 'redo-button',
		icon: '/resources/images/tools/redo.png',
		tooltip: 'Redo',
		disabled: true,
		handler: bindCommandHandler(redoCommand = new RedoCommand())
	}, {
		xtype: 'tbseparator'
	}, {
		toggleGroup: 'tool',
		icon: '/resources/images/tools/drag.png',
		tooltip: 'Drag Tool',
		pressed: true,
		handler: bindToolHandler(activeTool = dragTool = new DragTool())
	}, new ToolGroup([{
		text: 'Stamp Tile Tool',
		icon: '/resources/images/tools/stamp_tile.png',
		handler: bindToolHandler(new StampTileTool())
	}, {
		text: 'Stamp Entity Tool',
		icon: '/resources/images/tools/stamp_entity.png',
		handler: bindToolHandler(new StampEntityTool())
	}]), new ToolGroup([{
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
	}, new ToolGroup([{
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
	}]), new ToolGroup([{
		text: 'Drag-Select Tool',
		icon: '/resources/images/tools/drag_select.png',
		handler: bindToolHandler(new DragSelectTool())
	}, {
		text: 'Flood-Select Tool',
		icon: '/resources/images/tools/flood_select.png',
		handler: bindToolHandler(new FloodSelectTool())
	}]), new ToolGroup([{
		text: 'Cut Tiles Command',
		icon: '/resources/images/tools/cut_tiles.png',
		handler: bindCommandHandler(cutTilesCommand = new CutTilesCommand())
	}, {
		text: 'Copy Tiles Command',
		icon: '/resources/images/tools/copy_tiles.png',
		handler: bindCommandHandler(copyTilesCommand = new CopyTilesCommand())
	}, {
		text: 'Paste Tiles Tool',
		icon: '/resources/images/tools/paste_tiles.png',
		handler: bindToolHandler(pasteTilesTool = new PasteTilesTool())
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

	var registerCanvasHandler = (function (canvas) {
		return function (eventName, callback) {
			canvas.addEventListener(eventName, function (event) {
				event.preventDefault();
				event.stopPropagation();
				var rect = canvas.getBoundingClientRect();
				callback.call(
					canvas,
					event.clientX - rect.left,
					event.clientY - rect.top,
					event
					);
				return false;
			}, false);
		};
	}(Ext.getDom('canvas')));

	var down = false;
	registerCanvasHandler('mousemove', function (x, y) {
		if (down) {
			if (activeTool.mousedrag) {
				activeTool.mousedrag(x, y);
			}
		} else {
			if (activeTool.mousemove) {
				activeTool.mousemove(x, y);
			}
		}
	});
	registerCanvasHandler('mousedown', function (x, y) {
		down = true;
		if (activeTool.mousedown) {
			activeTool.mousedown(x, y);
		}
	});
	registerCanvasHandler('mouseup', function (x, y) {
		if (activeTool.mouseup) {
			activeTool.mouseup(x, y);
		}
		down = false;
	});

	Ext.getCmp('toolbar').add(toolButtons);

	(function (keyboard) {
		(function () {
			var toolCache = null;
			keyboard.handleDown(KeyEvent.DOM_VK_SPACE, function () {
				if (!toolCache) {
					toolCache = switchTool(dragTool);
				}
				return false;
			});
			keyboard.handleUp(KeyEvent.DOM_VK_SPACE, function () {
				if (toolCache) {
					switchTool(toolCache);
					toolCache = null;
				}
				return false;
			});
			keyboard.handleDown(KeyEvent.DOM_VK_ESCAPE, function () {
				toolCache = null;
				switchTool(dragTool);
				// FIXME select right toolbar button
			});
		}());
		keyboard.handleDown([
			KeyEvent.DOM_VK_SHIFT,
			KeyEvent.DOM_VK_CONTROL
		], function () {
			if (activeTool.flag) {
				activeTool.flag(true);
			}
		});
		keyboard.handleUp([
			KeyEvent.DOM_VK_SHIFT,
			KeyEvent.DOM_VK_CONTROL
		], function () {
			if (activeTool.flag) {
				activeTool.flag(false);
			}
		});
		keyboard.handleDown(KeyEvent.DOM_VK_S, function () {
			if (keyboard.isControlDown()) {
				doSave();
				return false;
			}
		});
		keyboard.handleDown(KeyEvent.DOM_VK_Z, function () {
			if (keyboard.isControlDown()) {
				if (keyboard.isShiftDown()) {
					redoCommand.activate && redoCommand.activate();
				} else {
					undoCommand.activate && undoCommand.activate();
				}
				return false;
			}
		});
		keyboard.handleDown(KeyEvent.DOM_VK_Y, function () {
			if (keyboard.isControlDown()) {
				redoCommand.activate && redoCommand.activate();
				return false;
			}
		});
		keyboard.handleDown(KeyEvent.DOM_VK_C, function () {
			if (keyboard.isControlDown()) {
				copyTilesCommand.activate && copyTilesCommand.activate();
				return false;
			}
		});
		keyboard.handleDown(KeyEvent.DOM_VK_X, function () {
			if (keyboard.isControlDown()) {
				cutTilesCommand.activate && cutTilesCommand.activate();
				return false;
			}
		});
		keyboard.handleDown(KeyEvent.DOM_VK_V, function () {
			if (keyboard.isControlDown()) {
				switchTool(pasteTilesTool);
				return false;
			}
		});
	}(new Keyboard()));
}
