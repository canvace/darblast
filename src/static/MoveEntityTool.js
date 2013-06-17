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

function MoveEntityTool() {
	var instance = false;
	var k = 0;
	this.mousedown = function (x, y) {
		instance = Canvace.instances.pick(x, y);
		k = Canvace.layers.getSelected();
		if (instance !== false) {
			var p = Canvace.view.unproject(x, y, k);
			instance.setPosition(p[0], p[1], k, true);
			Canvace.renderer.render();
		}
	};
	this.mousedrag = function (x, y) {
		if (instance !== false) {
			var p = Canvace.view.unproject(x, y, k);
			instance.setPosition(p[0], p[1], k, true);
			Canvace.renderer.render();
		}
	};
	this.mouseup = function (x, y) {
		if (instance !== false) {
			var p = Canvace.view.unproject(x, y, k);
			instance.setPosition(p[0], p[1], k, false);
			Canvace.renderer.render();
		}
	};
}
