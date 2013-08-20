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
	this.elements = {};
	this.nextId = 0;
	this.count = 0;
	this.resetCount = 0;
	this.fastAdd.apply(this, arguments);
};

MultiSet.prototype.add = function (element) {
	var id = this.nextId++;
	this.elements[id] = element;
	this.count++;
	var resetCount = this.resetCount;
	return function () {
		if (resetCount < this.resetCount) {
			return false;
		} else {
			if (this.elements.hasOwnProperty(id)) {
				delete this.elements[id];
				this.count--;
				return true;
			} else {
				return false;
			}
		}
	}.bind(this);
};

MultiSet.prototype.fastAdd = function () {
	for (var i in arguments) {
		this.elements[this.nextId++] = arguments[i];
	}
	this.count += arguments.length;
};

MultiSet.prototype.forEach = function (action) {
	for (var id in this.elements) {
		if (this.elements.hasOwnProperty(id)) {
			if (action(this.elements[id], function (id) {
				var resetCount = this.resetCount;
				return function () {
					if (resetCount < this.resetCount) {
						return false;
					} else {
						if (this.elements.hasOwnProperty(id)) {
							delete this.elements[id];
							this.count--;
							return true;
						} else {
							return false;
						}
					}
				}.bind(this);
			}.call(this, id)) === false) {
				return true;
			}
		}
	}
	return false;
};

MultiSet.prototype.fastForEach = function (action) {
	for (var id in this.elements) {
		if (this.elements.hasOwnProperty(id)) {
			action(this.elements[id]);
		}
	}
};

MultiSet.prototype.count = function () {
	return this.count;
};

MultiSet.prototype.isEmpty = function () {
	return !this.count;
};

MultiSet.prototype.clear = function () {
	this.elements = {};
	this.count = 0;
	this.resetCount++;
};
