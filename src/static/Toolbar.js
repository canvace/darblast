function Toolbar() {
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
		icon: '/resources/images/tools/save.png',
		tooltip: 'Save',
		handler: function () {
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
	}, {
		icon: '/resources/images/tools/export.png',
		tooltip: 'Export...',
		handler: function () {
			var dialog = new Ext.window.Window({
				title: 'Export Wizard',
				resizable: false,
				width: 400,
				modal: true,
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				bbar: [{
					text: 'Close',
					handler: function () {
						dialog.close();
					}
				}],
				items: [{
					xtype: 'radiogroup',
					defaults: {
						name: 'format'
					},
					items: [{
						inputValue: 'single',
						boxLabel: 'Single JSON file'
					}, {
						inputValue: 'separate',
						boxLabel: 'Separate images',
						checked: true
					}]
				}, {
					layout: 'accordion',
					items: [{
						title: 'Store to backend',
						layout: {
							type: 'vbox',
							align: 'stretch'
						},
						bbar: [{
							xtype: 'button',
							text: 'Store',
							handler: function () {
								// TODO
							}
						}],
						items: [{
							xtype: 'textfield',
							fieldLabel: 'Destination path'
						}, {
							xtype: 'directorytree',
							height: 200,
							listeners: {
								directoryselect: function () {
									// TODO
								}
							}
						}]
					}, {
						title: 'Download to frontend',
						bbar: [{
							text: 'Download',
							handler: function () {
								// TODO submit form
							}
						}]
					}]
				}]
			}).show();
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

	var registerCanvasHandler = (function (canvas) {
		return function (eventName, callback) {
			canvas.addEventListener(eventName, function (event) {
				var rect = canvas.getBoundingClientRect();
				callback.call(
					canvas,
					event.clientX - rect.left,
					event.clientY - rect.top,
					event
					);
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
}
