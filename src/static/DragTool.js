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

function DragTool() {
	var origin;
	var x0, y0;
	this.mousedown = function (x, y) {
		origin = Canvace.view.getOrigin();
		x0 = x;
		y0 = y;
	};
	this.mousedrag = function (x, y) {
		Canvace.view.dragBy(x - x0, y - y0);
		x0 = x;
		y0 = y;
		Canvace.renderer.render();
	};
	this.mouseup = function () {
		(function (o0, o1) {
			if ((o0.x != o1.x) || (o0.y != o1.y)) {
				Canvace.history.record({
					action: function () {
						Canvace.view.dragTo(o1.x, o1.y);
						Canvace.renderer.render();
					},
					reverse: function () {
						Canvace.view.dragTo(o0.x, o0.y);
						Canvace.renderer.render();
					}
				});
			}
		}(origin, Canvace.view.getOrigin()));
	};
}
