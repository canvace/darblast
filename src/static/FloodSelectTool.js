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

function FloodSelectTool() {
	this.activate = function () {
		Canvace.selection.show();
		Canvace.renderer.render();
	};
	this.deactivate = function () {
		Canvace.selection.hide();
		Canvace.renderer.render();
	};

	var flag = false;
	this.flag = function (on) {
		flag = on;
	};

	this.mouseup = function (x, y) {
		Canvace.history.nest(function () {
			if (!flag) {
				Canvace.selection.dismiss();
			}
			var k = Canvace.layers.getSelected();
			var cell = Canvace.view.getCell(x, y, k);
			Canvace.array.floodLayer(k, cell.i, cell.j, Canvace.selection.addFragment);
		});
		Canvace.renderer.render();
	};
}
