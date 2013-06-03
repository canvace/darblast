function PositioningControls(element) {
	var layout = element.getLayout();
	var metrics = Canvace.view.calculateBoxMetrics(layout.span.i, layout.span.j, 1);

	var guidelines = Canvace.view.generateBox(layout.span.i, layout.span.j, 1);
	guidelines.style.position = 'absolute';
	guidelines.style.left = metrics.left + 'px';
	guidelines.style.top = metrics.top + 'px';

	var target = null;

	return {
		title: 'Positioning',
		layout: 'hbox',
		items: [{
			xtype: 'container',
			layout: 'fit',
			width: 250,
			height: 250,
			resizable: {
				pinned: true,
				handles: 'e s se'
			},
			items: {
				xtype: 'box',
				autoEl: {
					tag: 'div',
					style: 'position: relative; left: 0; top: 0; overflow: hidden',
					children: [{
						tag: 'div',
						cls: 'position-schema-reference',
						style: 'position: absolute; left: 50%; top: 50%',
						children: [{
							tag: 'img',
							cls: 'position-schema-target',
							style: 'position: absolute; left: ' + element.getOffsetX() + '; top: ' + element.getOffsetY() + '; opacity: 0.5',
							src: '/images/' + element.getFirstFrameId()
						}]
					}]
				}
			}
		}, {
			xtype: 'container',
			layout: 'vbox',
			items: [{
				xtype: 'numberfield',
				fieldLabel: 'X',
				value: element.getOffsetX(),
				listeners: {
					render: function () {
						element.onUpdate(function () {
							// TODO
						});
					},
					change: function (field, value) {
						element.setOffsetX(parseFloat(value));
					}
				}
			}, {
				xtype: 'numberfield',
				fieldLabel: 'Y',
				value: element.getOffsetY(),
				listeners: {
					render: function () {
						element.onUpdate(function () {
							// TODO
						});
					},
					change: function (field, value) {
						element.setOffsetY(parseFloat(value));
					}
				}
			}, {
				xtype: 'checkbox',
				boxLabel: 'Transparency',
				checked: true,
				listeners: {
					change: function (field, checked) {
						target.setOpacity(checked ? 0.5 : 1);
					}
				}
			}, {
				xtype: 'checkbox',
				boxLabel: 'Animate',
				checked: true,
				listeners: {
					change: function () {
						// TODO
					}
				}
			}, {
				xtype: 'button',
				text: 'Update',
				handler: function () {
					element.updateAfterReposition();
				}
			}]
		}],
		listeners: {
			render: function (component) {
				var element = component.getEl();
				element.down('.position-schema-reference').insertFirst(guidelines);
				target = element.down('.position-schema-reference .position-schema-target');
			}
		}
	};
}
