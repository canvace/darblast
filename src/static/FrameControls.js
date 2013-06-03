function FrameControls(element) {
	var view = new Ext.view.View({
		cls: 'view',
		autoScroll: true,
		multiSelect: true,
		trackOver: true,
		overItemCls: 'x-item-over',
		width: 300,
		height: 200,
		resizable: {
			pinned: true,
			handles: 'e s se'
		},
		store: {
			autoSync: true,
			fields: ['frame', {
				name: 'frameId',
				type: 'int'
			}, {
				name: 'imageId',
				type: 'string'
			}, {
				name: 'index',
				type: 'int'
			}],
			sortOnLoad: true,
			sorters: ['frameId'],
			data: (function () {
				var frames = [];
				element.forEachFrame(function (frame) {
					frames.push({
						frame: frame,
						frameId: frame.getFrameId(),
						imageId: frame.getImageId()
					});
				});
				return frames;
			}())
		},
		tpl: [
			'<tpl for=".">',
			'	<div class="thumb-wrap">',
			'		<div class="thumb">',
			'			<img src="/images/{imageId}" alt="{frameId}"/>',
			'		</div>',
			'	</div>',
			'</tpl>',
			'<div class="x-clear"></div>'
		],
		itemSelector: 'div.thumb-wrap',
		emptyText: 'No frames',
		plugins: [
			Ext.create('Ext.ux.DataView.DragSelector', {})
		]
	});

	var store = view.getStore();

	element.onAddFrame(function (id) {
		var frame = element.getFrame(id);
		var record = store.add({
			frame: frame,
			frameId: frame.getFrameId(),
			imageId: frame.getImageId()
		})[0];
		frame.onDelete(function () {
			record.destroy();
		});
	});
	element.forEachFrame(function (frame) {
		frame.onDelete(function () {
			var record = store.findRecord('frameId', frame.getFrameId());
			if (record) {
				record.destroy();
			}
		});
	});

	return {
		title: 'Frames',
		layout: 'hbox',
		items: [{
			xtype: 'container',
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: [view, {
				xtype: 'toolbar',
				items: [{
					text: 'Add frame',
					iconCls: 'x-add',
					handler: function () {
						new ImageSelector(false, function (ids) {
							if (ids.length) {
								element.addFrame(ids[0], 100);
							}
						});
					}
				}, {
					text: 'Remove selected',
					iconCls: 'x-delete',
					disabled: true,
					handler: function () {
						view.getSelectionModel().getSelection().forEach(function (record) {
							record.get('frame')._delete();
						});
					},
					listeners: {
						render: function () {
							var button = this;
							view.on('selectionchange', function (selectionModel, selected) {
								if (selected.length) {
									button.enable();
								} else {
									button.disable();
								}
							});
						}
					}
				}]
			}]
		}, {
			xtype: 'container',
			layout: 'vbox',
			items: [(function () {
				var selectedFrame = null;
				return {
					xtype: 'numberfield',
					fieldLabel: 'Duration',
					disabled: true,
					minValue: 0,
					value: 100,
					listeners: {
						render: function () {
							var field = this;
							view.on('selectionchange', function (selectionModel, selected) {
								if (selected.length != 1) {
									selectedFrame = null;
									field.setValue(100);
									field.disable();
								} else {
									selectedFrame = selected[0].get('frame');
									if (selectedFrame.isLast()) {
										field.setValue(100);
										field.disable();
									} else {
										field.enable();
										field.setValue(selectedFrame.getDuration());
									}
								}
							});
						},
						change: function (field, value) {
							if (selectedFrame) {
								selectedFrame.setDuration(value);
							}
						}
					}
				};
			}()), {
				xtype: 'checkbox',
				boxLabel: 'Loop animation',
				checked: (function () {
					var loop = false;
					element.forEachFrame(function (frame) {
						loop = !frame.isLast();
					});
					return loop;
				}()),
				listeners: {
					change: function (field, checked) {
						var lastFrame = null;
						element.forEachFrame(function (frame) {
							if (frame.isLast()) {
								frame.setDuration(100);
							}
							lastFrame = frame;
						});
						if (!checked && lastFrame) {
							lastFrame.setLast();
						}
					}
				}
			}]
		}]
	};
}
