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

function PositioningControls(element) {
	var layout = element.getLayout();
	var metrics = Canvace.view.calculateBoxMetrics(layout.span.i, layout.span.j, 1);

	var guidelines = Canvace.view.generateBox(layout.span.i, layout.span.j, 1);
	guidelines.style.position = 'absolute';
	guidelines.style.left = metrics.left + 'px';
	guidelines.style.top = metrics.top + 'px';

	var target = null;
	var toggleAnimation = function () {};

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
					style: 'position: relative; left: 0px; top: 0px; overflow: hidden',
					children: [{
						tag: 'div',
						cls: 'position-schema-reference',
						style: 'position: absolute; left: 50%; top: 50%',
						children: [{
							tag: 'div',
							cls: 'position-schema-target',
							style: 'position: absolute; left: ' + element.getOffsetX() + 'px; top: ' + element.getOffsetY() + 'px; opacity: 0.5',
							children: (function (children) {
								var frames = [];
								element.forEachFrame(function (frame) {
									var id = Ext.id();
									var frameData = {
										id: id
									};
									if (!frame.isLast()) {
										frameData.duration = frame.getDuration();
									}
									frames.push(frameData);
									children.push({
										tag: 'img',
										id: id,
										style: 'display: none',
										src: '/images/' + frame.getImageId()
									});
								});
								toggleAnimation = function animate() {
									frames.forEach(function (frame) {
										Ext.get(frame.id).setDisplayed('none');
									});
									var stop = false;
									if (frames.length) {
										(function setFrame(index) {
											var frame = Ext.get(frames[index].id);
											frame.setDisplayed('inline');
											if (!stop && ('duration' in frames[index])) {
												setTimeout(function () {
													frame.setDisplayed('none');
													setFrame((index + 1) % frames.length);
												}, frames[index].duration);
											}
										}(0));
									}
									toggleAnimation = function () {
										stop = true;
										toggleAnimation = animate;
										return false;
									};
									return true;
								};
								return children;
							}([]))
						}]
					}, {
						tag: 'div',
						cls: 'position-schema-handle',
						style: 'position: absolute; left: 0px; top: 0px; width: 100%; height: 100%'
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
					change: function (field, checked) {
						if (toggleAnimation() != checked) {
							toggleAnimation();
						}
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
				(new DragTracker(target.dom, domElement.down('.position-schema-handle').dom)).onDragEnd(element.setOffset);
				element.onUpdate(function (diff) {
					if (diff.offset) {
						target.setStyle({
							left: element.getOffsetX() + 'px',
							top: element.getOffsetY() + 'px'
						});
					}
				});
				toggleAnimation();
			}
		}
	};
}
