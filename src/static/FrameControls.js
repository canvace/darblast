function FrameControls(element) {
	var view = new Ext.view.View({
		cls: 'view',
		autoScroll: true,
		multiSelect: true,
		trackOver: true,
		overItemCls: 'x-item-over',
		maxWidth: 250,
		minHeight: 150,
		resizable: true,
		border: true,
		style: {
			borderColor: 'black',
			borderStyle: 'solid'
		},
		store: {
			fields: ['frame', {
				name: 'frameId',
				type: 'int'
			}, {
				name: 'imageId',
				type: 'string'
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
		emptyText: 'No frames'
	});
	return {
		title: 'Frames',
		layout: 'hbox',
		items: [{
			xtype: 'container',
			layout: {
				type: 'table',
				columns: 1
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
					}
				}]
			}]
		}, {
			xtype: 'container',
			layout: 'vbox',
			items: [{
				xtype: 'numberfield',
				fieldLabel: 'Duration',
				disabled: true,
				minValue: 0,
				value: 100,
				listeners: {
					change: function () {
						// TODO
					}
				}
			}, {
				xtype: 'checkbox',
				boxLabel: 'Loop animation',
				checked: (function () {
					for (var i in element.frames) {
						if (!('duration' in element.frames[i])) {
							return false;
						}
					}
					return true;
				}()),
				listeners: {
					change: function () {
						// TODO
					}
				}
			}]
		}]
	};
}
