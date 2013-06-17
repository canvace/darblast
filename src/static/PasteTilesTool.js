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

function PasteTilesTool() {
	var i0 = 0;
	var j0 = 0;
	this.activate = function () {
		var I = 0;
		var J = 0;
		var count = 0;
		Canvace.clipboard.forEach(function (i, j) {
			I += i;
			J += j;
			count++;
		});
		i0 = Math.round(I / count);
		j0 = Math.round(J / count);
		// TODO build and show phantom
	};
	this.mouseup = function (x, y) {
		var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		Canvace.clipboard.paste(cell.i - i0, cell.j - j0);
		Canvace.renderer.render();
	};
}
