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
		var containerId = Ext.id();
		config.html = '<div id="' + containerId + '" style="padding: 24px"><div class="offset" style="position: relative; left: 0px; top: 0px"></div></div>';
		this.callParent([config]);
		this.containerId = containerId;
		this.cursor = Canvace.view.generateTileHighlight();
		this.cursor.style.position = 'absolute';
		this.on('afterrender', function () {
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

		var container = document.querySelector('#' + this.containerId);
		var offset = document.querySelector('#' + this.containerId + ' .offset');

		var oldCanvas = document.querySelector('#' + this.containerId + ' .offset canvas');
		var newCanvas = Canvace.view.generateBox(i, j, 0);

		newCanvas.addEventListener('click', function (event) {
			var cell = Canvace.view.getCell(event.clientX, event.clientY, 0);
			this.setCell(cell.i, cell.j);
		}.bind(this), false);

		if (oldCanvas) {
			offset.replaceChild(oldCanvas, newCanvas);
		} else {
			offset.appendChild(newCanvas);
			offset.appendChild(this.cursor);
		}

		this.setSize(container.clientWidth, container.clientHeight);
	},

	getCell: function () {
		return {
			i: this.i0,
			j: this.j0
		};
	},

	setCell: function (i0, j0) {
		this.i0 = i0;
		this.j0 = j0;
		var position = Canvace.view.project(i0, j0, 0);
		this.cursor.style.left = position[0] + 'px';
		this.cursor.style.top = position[1] + 'px';
	}
});
