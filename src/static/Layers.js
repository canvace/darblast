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

function Layers() {
	var minK, maxK, selected;
	var off = {};

	var selectHandlers = new MultiSet();

	(function () {
		var first = true;
		Canvace.array.forEachLayer(function (k) {
			if (first) {
				selected = minK = maxK = k;
				first = false;
			} else {
				selected = minK = Math.min(minK, k);
				maxK = Math.max(maxK, k);
			}
		});
		if (first) {
			selected = minK = maxK = 0;
		}
	}());

	this.addAbove = function (emplace) {
		emplace(++maxK);
		selected = maxK;
		selectHandlers.fastForEach(function (handler) {
			handler(selected);
		});
	};
	this.addBelow = function (emplace) {
		emplace(--minK);
		selected = minK;
		selectHandlers.fastForEach(function (handler) {
			handler(selected);
		});
	};
	this.forEach = function (action) {
		for (var k = minK; k <= maxK; k++) {
			action(k);
		}
	};
	this.erase = function (k) {
		Canvace.array.eraseLayer(k);
		delete off[k];
		var remove = false;
		if (minK != maxK) {
			if (k == minK) {
				minK++;
				remove = true;
			} else if (k == maxK) {
				maxK--;
				remove = true;
			}
			selected = Math.min(selected, minK);
			selected = Math.max(selected, maxK);
			selectHandlers.fastForEach(function (handler) {
				handler(selected);
			});
		}
		return remove;
	};

	this.select = function (k) {
		selected = k;
		selectHandlers.fastForEach(function (handler) {
			handler(selected);
		});
	};
	this.getSelected = function () {
		return selected;
	};
	this.onSelect = selectHandlers.add;

	this.toggle = function (k, on) {
		off[k] = !on;
	};
	this.isOn = function (k) {
		return !off[k];
	};
}
