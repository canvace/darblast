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

Ext.define('Darblast.ux.TileSchema', (function () {
	var containerId = Ext.id();
	var iSpan = 1;
	var jSpan = 1;

	return {
		extend: 'Ext.Component',
		alias: 'widget.tileschema',

		constructor: function (config) {
			config = config || {};
			config.html = '<div id="' + containerId + '" style="padding: 24px; position: relative; left: 0px; top: 0px"></div>';
			this.callParent([config]);
			this.on('afterrender', function () {
				this.setSpan(iSpan, jSpan);
			});
		},

		getSpan: function () {
			return {
				i: iSpan,
				j: jSpan
			};
		},

		setSpan: function (i, j) {
			iSpan = i;
			jSpan = j;
			var container = document.querySelector('#' + containerId);
			var oldCanvas = document.querySelector('#' + containerId + ' canvas');
			var newCanvas = Canvace.view.generateBox(i, j, 1);
			newCanvas.style.position = 'absolute';
			newCanvas.style.left = 0;
			newCanvas.style.top = 0;
			if (oldCanvas) {
				container.replaceChild(oldCanvas, newCanvas);
			} else {
				container.appendChild(newCanvas);
				// TODO place cursor
			}
			this.setSize(container.clientWidth, container.clientHeight);
		}
	};
}()));
