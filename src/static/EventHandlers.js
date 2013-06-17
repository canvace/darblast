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

function EventHandlers() {
	var handlers = {};
	var triggers = {};
	this.registerHandler = function (key, handler) {
		if (!(key in handlers)) {
			handlers[key] = new MultiSet();
		}
		return handlers[key].add(handler);
	};
	this.registerTrigger = function (key, trigger) {
		if (!(key in triggers)) {
			triggers[key] = new MultiSet();
		}
		return triggers[key].add(trigger);
	};
	function fireSet(set, firer) {
		if (firer) {
			set.fastForEach(function (handler) {
				firer(handler);
			});
		} else {
			set.fastForEach(function (handler) {
				handler();
			});
		}
	}
	this.fire = function (key, firer) {
		if (key in handlers) {
			fireSet(handlers[key], firer);
		}
		if (key in triggers) {
			var set = triggers[key];
			delete triggers[key];
			fireSet(set, firer);
		}
	};
	this.fireAll = function (firer) {
		var key;
		for (key in handlers) {
			fireSet(handlers[key], firer);
		}
		for (key in triggers) {
			var set = triggers[key];
			delete triggers[key];
			fireSet(set, firer);
		}
	};
	this.rehash = function (oldKey, newKey) {
		handlers[newKey] = handlers[oldKey];
		delete handlers[oldKey];
		triggers[newKey] = triggers[oldKey];
		delete triggers[oldKey];
	};
}
