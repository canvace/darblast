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

function EraseTilesTool() {
	this.activate = function () {
		Canvace.cursor
			.snap(true)
			.setTileHighlight()
			.show();
		Canvace.renderer.render();
	};
	this.deactivate = function () {
		Canvace.cursor.hide();
		Canvace.renderer.render();
	};
	var lastCell;
	this.mousedown = function (x, y) {
		lastCell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		Canvace.array.erase(lastCell.i, lastCell.j, lastCell.k);
		Canvace.renderer.render();
	};
	this.mousemove = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.renderer.render();
	};
	this.mousedrag = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		if ((cell.i != lastCell.i) || (cell.j != lastCell.j) || (cell.k != lastCell.k)) {
			lastCell = cell;
			Canvace.array.erase(cell.i, cell.j, cell.k);
			Canvace.renderer.render();
		}
	};
}
