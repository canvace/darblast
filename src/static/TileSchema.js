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

Ext.define('Darblast.ux.TileSchema', {
	extend: 'Ext.Component',
	alias: 'widget.tileschema',

	iSpan: 1,
	jSpan: 1,
	i0: 0,
	j0: 0,

	constructor: function (config) {
		config = config || {};
		config.autoEl = {
			tag: 'div',
			children: [{
				tag: 'div',
				cls: 'frame',
				style: 'padding: 24px; display: inline-block',
				children: [{
					tag: 'div',
					cls: 'container',
					style: 'display: inline-block; position: relative; left: 0px; top: 0px',
					children: [{
						tag: 'div',
						cls: 'offset',
						style: 'position: absolute'
					}]
				}]
			}]
		};
		this.callParent([config]);
		this.cursor = Canvace.view.generateTileHighlight();
		this.cursor.style.position = 'absolute';
		this.on('render', function () {
			this.setSpan(this.iSpan, this.jSpan);
			this.setCell(this.i0, this.j0);
		});
	},

	getSpan: function () {
		return {
			i: this.iSpan,
			j: this.jSpan
		};
	},

	setSpan: function (i, j) {
		this.iSpan = i;
		this.jSpan = j;

		var element = this.getEl();

		var frame = element.down('.frame').dom;
		var container = element.down('.frame .container').dom;
		var offset = element.down('.frame .container .offset').dom;

		var oldCanvas = (function () {
			var canvasElement = element.down('.container canvas');
			if (canvasElement) {
				return canvasElement.dom;
			} else {
				return null;
			}
		}());
		var newCanvas = Canvace.view.generateBox(i, j, 0);

		newCanvas.addEventListener('click', (function (thisObject) {
			var metrics = Canvace.view.calculateBoxMetrics(i, j, 0);
			return function (event) {
				var cell = Canvace.view.getCell2(event.offsetX, event.offsetY, 0, -metrics.left, -metrics.top);
				this.setCell(cell.i, cell.j);
			}.bind(thisObject);
		}(this)), false);

		if (oldCanvas) {
			container.replaceChild(newCanvas, oldCanvas);
		} else {
			(function () {
				var metrics = Canvace.view.calculateBoxMetrics(1, 1, 0);
				offset.style.left = metrics.left + 'px';
				offset.style.top = metrics.top + 'px';
			}());
			container.insertBefore(newCanvas, offset);
			offset.appendChild(this.cursor);
		}
		this.setCell(this.i0, this.j0);

		this.setSize(frame.clientWidth, frame.clientHeight);
	},

	getCell: function () {
		return {
			i: this.i0,
			j: this.j0
		};
	},

	setCell: function (i0, j0) {
		this.i0 = Math.min(this.iSpan - 1, Math.max(0, i0));
		this.j0 = Math.min(this.jSpan - 1, Math.max(0, j0));
		var position = Canvace.view.project(this.i0, this.j0, 0);
		var metrics = Canvace.view.calculateBoxMetrics(this.iSpan, this.jSpan, 0);
		this.cursor.style.left = (position[0] - metrics.left) + 'px';
		this.cursor.style.top = (position[1] - metrics.top) + 'px';
	}
});
