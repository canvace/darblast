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

function Diff(k, array) {
	var diff = {};

	this.put = function (i, j, value) {
		if (!(i in diff)) {
			diff[i] = {};
		}
		if (j in diff[i]) {
			diff[i][j].to = value;
		} else {
			diff[i][j] = {
				from: array[k][i][j],
				to: value
			};
		}
	};
	this.erase = function (i, j) {
		if (!(i in diff)) {
			diff[i] = {};
		}
		if (j in diff[i]) {
			diff[i][j].to = false;
		} else if (j in array[k][i]) {
			diff[i][j] = {
				from: array[k][i][j],
				to: false
			};
		}
	};

	function run(from, to) {
		for (var i in diff) {
			for (var j in diff[i]) {
				if (typeof diff[i][j][from] === 'number') {
					Canvace.buckets.eraseTile(i, j, k);
				}
				if (diff[i][j][to] !== false) {
					if (typeof diff[i][j][to] === 'number') {
						Canvace.buckets.addTile(i, j, k, Canvace.tiles.get(diff[i][j][to]));
					}
					array[k][i][j] = diff[i][j][to];
				} else {
					delete array[k][i][j];
				}
			}
		}
	}

	this.isNull = function () {
		for (var i in diff) {
			for (var j in diff[i]) {
				if (diff[i][j].from !== diff[i][j].to) {
					return false;
				}
			}
		}
		return true;
	};

	this.apply = function () {
		run('from', 'to');
	};
	this.reverse = function () {
		run('to', 'from');
	};
}
