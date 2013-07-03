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

	constructor: function (config) {
		config = config || {};
		var containerId = Ext.id();
		config.html = '<div id="' + containerId + '" style="padding: 24px"><div class="offset" style="position: relative; left: 0px; top: 0px"></div></div>';
		this.callParent([config]);
		this.containerId = containerId;
		this.iSpan = 1;
		this.jSpan = 1;
		this.on('afterrender', function () {
			this.setSpan(1, 1);
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
		if (oldCanvas) {
			offset.replaceChild(oldCanvas, newCanvas);
		} else {
			offset.appendChild(newCanvas);
			var cursor = Canvace.view.generateTileHighlight();
			cursor.style.position = 'absolute';
			cursor.style.left = 0;
			cursor.style.top = 0;
			offset.appendChild(cursor);
		}
		this.setSize(container.clientWidth, container.clientHeight);
	}
});
