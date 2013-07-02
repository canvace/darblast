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

function DragSelectTool() {
	this.activate = function () {
		Canvace.selection.show();
		Canvace.cursor
			.snap(true)
			.setTileHighlight()
			.show();
		Canvace.renderer.render();
	};
	this.deactivate = function () {
		Canvace.cursor.hide();
		Canvace.selection.hide();
		Canvace.renderer.render();
	};

	var flag = false;
	this.flag = function (on) {
		flag = on;
	};

	var x0, y0;
	this.mousedown = function (x, y) {
		if (!flag) {
			Canvace.selection.dismiss();
		}
		Canvace.selection.setCurrentArea(x0 = x, y0 = y, x, y);
		Canvace.cursor.hide();
		Canvace.renderer.render();
	};
	this.mousemove = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.renderer.render();
	};
	this.mousedrag = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.selection.setCurrentArea(x0, y0, x, y);
		Canvace.renderer.render();
	};
	this.mouseup = function () {
		Canvace.selection.freezeCurrentArea();
		Canvace.cursor.show();
	};
}
