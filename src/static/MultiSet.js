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

function MultiSet() {
	var elements = {};
	var nextId = 0;
	var count = 0;

	function add(element) {
		var id = nextId++;
		elements[id] = element;
		count++;
		return function () {
			if (elements.hasOwnProperty(id)) {
				delete elements[id];
				count--;
				return true;
			} else {
				return false;
			}
		};
	}

	(function (elements) {
		for (var i in elements) {
			add(elements[i]);
		}
	}(arguments));

	this.add = add;

	this.forEach = function (action) {
		for (var id in elements) {
			if (action(elements[id], (function (id) {
				return function () {
					if (elements.hasOwnProperty(id)) {
						delete elements[id];
						count--;
						return true;
					} else {
						return false;
					}
				};
			}(id))) === false) {
				return true;
			}
		}
		return false;
	};

	this.fastForEach = function (action) {
		for (var id in elements) {
			action(elements[id]);
		}
	};

	this.count = function () {
		return count;
	};

	this.isEmpty = function () {
		return !count;
	};

	this.clear = function () {
		elements = {};
		count = 0;
	};
}
