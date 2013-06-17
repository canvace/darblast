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

function Cursor() {
	var thisObject = this;
	var visible = false;
	var snap = true;
	var elements = [];

	var i = 0;
	var j = 0;

	this.show = function () {
		visible = true;
		return thisObject;
	};

	this.hide = function () {
		visible = false;
		return thisObject;
	};

	this.moveToIJ = function (i1, j1) {
		if (snap) {
			i = Math.floor(i1);
			j = Math.floor(j1);
		} else {
			i = i1;
			j = j1;
		}
	};
	this.moveToXY = function (x, y) {
		var cell = Canvace.view.unproject(x, y, Canvace.layers.getSelected());
		if (snap) {
			i = Math.floor(cell[0]);
			j = Math.floor(cell[1]);
		} else {
			i = cell[0];
			j = cell[1];
		}
	};

	this.snap = function (on) {
		if (snap = !!on) {
			i = Math.floor(i);
			j = Math.floor(j);
		}
		return thisObject;
	};

	this.reset = function () {
		elements = [];
		return thisObject;
	};
	this.addElement = function (element, x, y) {
		elements.push({
			element: element,
			x: x,
			y: y
		});
		return thisObject;
	};
	this.setTileHighlight = function () {
		var metrics = Canvace.view.calculateBoxMetrics(1, 1, 0);
		elements = [{
			element: Canvace.view.generateTileHighlight(),
			x: metrics.left,
			y: metrics.top
		}];
		return thisObject;
	};

	this.draw = function (context) {
		if (visible) {
			context.globalAlpha = 0.5;
			var position = Canvace.view.project(i, j, Canvace.layers.getSelected());
			elements.forEach(function (info) {
				context.drawImage(info.element, position[0] + info.x, position[1] + info.y);
			});
			context.globalAlpha = 1;
		}
	};
}
