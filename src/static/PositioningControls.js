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
						var field = this;
						element.onUpdate(function () {
							field.setValue(element.getOffsetX());
						});
					},
					change: function (field, newValue, oldValue) {
						if (newValue != oldValue) {
							element.setOffsetX(parseFloat(newValue));
						}
					}
				}
			}, {
				xtype: 'numberfield',
				fieldLabel: 'Y',
				value: element.getOffsetY(),
				listeners: {
					render: function () {
						var field = this;
						element.onUpdate(function () {
							field.setValue(element.getOffsetY());
						});
					},
					change: function (field, newValue, oldValue) {
						if (newValue != oldValue) {
							element.setOffsetY(parseFloat(newValue));
						}
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
				var domElement = component.getEl();
				domElement.down('.position-schema-reference').insertFirst(guidelines);
				target = domElement.down('.position-schema-reference .position-schema-target');
				(function () {
					var dragging = false;
					var x0, y0;
					target.dom.addEventListener('mousedown', function (event) {
						dragging = true;
						x0 = event.clientX;
						y0 = event.clientY;
						event.preventDefault();
					}, false);
					target.dom.addEventListener('mousemove', function (event) {
						if (dragging) {
							target.setStyle({
								left: (event.target.offsetLeft + event.clientX - x0) + 'px',
								top: (event.target.offsetTop + event.clientY - y0) + 'px'
							});
							x0 = event.clientX;
							y0 = event.clientY;
							event.preventDefault();
						}
					}, false);
					target.dom.addEventListener('mouseup', function (event) {
						if (dragging) {
							dragging = false;
							element.setOffset({
								x: event.target.offsetLeft,
								y: event.target.offsetTop
							});
							event.preventDefault();
						}
					}, false);
				}());
				element.onUpdate(function () {
					target.setStyle({
						left: element.getOffsetX() + 'px',
						top: element.getOffsetY() + 'px'
					});
				});
			}
		}
	};
}
