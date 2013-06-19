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

function TileClipboard() {
	var tiles = {};
	var changeHandlers = new EventHandlers();

	this.copy = function () {
		tiles = {};
		var k = Canvace.layers.getSelected();
		Canvace.selection.forEach(function (i, j) {
			var entry = Canvace.array.get(i, j, k);
			if (typeof entry === 'number') {
				if (!tiles[i]) {
					tiles[i] = {};
				}
				tiles[i][j] = entry;
			}
		});
		changeHandlers.fire(0);
	};
	this.cut = function () {
		tiles = {};
		var k = Canvace.layers.getSelected();
		Canvace.history.nest(function () {
			Canvace.selection.forEach(function (i, j) {
				var entry = Canvace.array.get(i, j, k);
				if (typeof entry === 'number') {
					if (!tiles[i]) {
						tiles[i] = {};
					}
					tiles[i][j] = entry;
					Canvace.array.erase(i, j, k);
				}
			});
		});
		changeHandlers.fire(0);
	};

	function forEach(action) {
		var k = Canvace.layers.getSelected();
		for (var i in tiles) {
			i = parseInt(i, 10);
			for (var j in tiles[i]) {
				j = parseInt(j, 10);
				action(i, j, k, tiles[i][j]);
			}
		}
	}

	this.forEach = forEach;
	this.paste = function (di, dj) {
		Canvace.history.nest(function () {
			forEach(function (i, j, k, id) {
				Canvace.array.set(i + di, j + dj, k, id);
			});
		});
	};

	this.onChange = function (handler) {
		return changeHandlers.registerHandler(0, handler);
	};
}
