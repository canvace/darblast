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

	var unregisterClipboardChangeHandler;

	this.activate = function () {
		var I = 0;
		var J = 0;
		var count = 0;
		Canvace.tileClipboard.forEach(function (i, j) {
			I += i;
			J += j;
			count++;
		});
		i0 = Math.round(I / count);
		j0 = Math.round(J / count);

		function setCursor() {
			Canvace.cursor.reset();
			Canvace.tileClipboard.forEach(function (i, j, k, tileId) {
				var tile = Canvace.tiles.get(tileId);
				if (tile.hasFrames()) {
					var cell = Canvace.view.project(i - i0, j - j0, 0);
					var offset = tile.getOffset();
					Canvace.cursor.addElement(
						Canvace.images.getImage(tile.getFirstFrameId()),
						cell[0] + offset.x,
						cell[1] + offset.y
						);
				}
			});
		}

		unregisterClipboardChangeHandler = Canvace.tileClipboard.onChange(setCursor);
		setCursor();

		Canvace.cursor.snap(true).show();
		Canvace.renderer.render();
	};

	this.deactivate = function () {
		unregisterClipboardChangeHandler();
		Canvace.cursor.hide();
		Canvace.renderer.render();
	};

	this.mousemove = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.renderer.render();
	};

	this.mouseup = function (x, y) {
		var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		Canvace.tileClipboard.paste(cell.i - i0, cell.j - j0);
		Canvace.renderer.render();
	};
}
