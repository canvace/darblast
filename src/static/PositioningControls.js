function PositioningControls(element) {
	var layout = element.getLayout();
	var guidelines = Canvace.view.generateBox(layout.span.i, layout.span.j, 1);
	return {
		title: 'Positioning',
		layout: 'hbox',
		items: [{
			xtype: 'container',
			layout: 'ux.center',
			width: 250,
			height: 250,
			resizable: {
				pinned: true,
				handles: 'e s se'
			},
			items: [{
				xtype: 'box',
				floating: true,
				shadow: false,
				autoShow: true,
				contentEl: guidelines
			}, {
				xtype: 'image',
				src: '/images/' + element.getFirstFrameId(),
				floating: true,
				shadow: false,
				autoShow: true,
				draggable: true
			}]
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
					change: function () {
						// TODO
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
		}]
	};
}
