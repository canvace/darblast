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

function History() {
	var thisObject = this;

	function Stack() {
		var entries = {};
		var pointer = -1;
		var top = -1;
		var bookmark = -1;

		this.record = function (entry) {
			for (var i = top; i > pointer; i--) {
				delete entries[i];
			}
			entries[top = ++pointer] = entry;
		};

		this.canUndo = function () {
			return pointer >= 0;
		};
		this.canRedo = function () {
			return pointer < top;
		};

		this.undo = function () {
			if (pointer >= 0) {
				entries[pointer--].reverse();
				return true;
			} else {
				return false;
			}
		};
		this.redo = function () {
			if (pointer < top) {
				entries[++pointer].action();
				return true;
			} else {
				return false;
			}
		};

		this.erase = function () {
			entries = {};
			pointer = -1;
			top = -1;
			bookmark = -1;
		};

		this.bookmark = function () {
			bookmark = pointer;
		};
		this.isBookmark = function () {
			return bookmark == pointer;
		};
	}

	var rootStack = new Stack();
	var canUndoHandlers = new EventHandlers();
	var canRedoHandlers = new EventHandlers();

	function rootRecord(entry) {
		rootStack.record(entry);
		canUndoHandlers.fire(0, function (handler) {
			handler(true);
		});
		canRedoHandlers.fire(0, function (handler) {
			handler(false);
		});
	}

	this.record = rootRecord;

	this.nest = function (callback, scope) {
		var subStack = new Stack();
		var parentRecord = thisObject.record;
		thisObject.record = subStack.record;
		try {
			callback.call(scope);
		} finally {
			parentRecord({
				action: function () {
					while (subStack.redo()) {}
				},
				reverse: function () {
					while (subStack.undo()) {}
				}
			});
			thisObject.record = parentRecord;
			canUndoHandlers.fire(0, function (handler) {
				handler(true);
			});
			canRedoHandlers.fire(0, function (handler) {
				handler(false);
			});
		}
	};

	this.canUndo = rootStack.canUndo;
	this.canRedo = rootStack.canRedo;

	this.onCanUndo = function (handler) {
		return canUndoHandlers.registerHandler(0, handler);
	};
	this.onCanRedo = function (handler) {
		return canRedoHandlers.registerHandler(0, handler);
	};

	this.undo = function () {
		if (rootStack.undo()) {
			canUndoHandlers.fire(0, function (handler) {
				handler(rootStack.canUndo());
			});
			canRedoHandlers.fire(0, function (handler) {
				handler(true);
			});
		}
	};
	this.redo = function () {
		if (rootStack.redo()) {
			canUndoHandlers.fire(0, function (handler) {
				handler(true);
			});
			canRedoHandlers.fire(0, function (handler) {
				handler(rootStack.canRedo());
			});
		}
	};
	this.erase = function () {
		// XXX don't call while nesting!
		rootStack.erase();
		canUndoHandlers.fire(0, function (handler) {
			handler(false);
		});
		canRedoHandlers.fire(0, function (handler) {
			handler(false);
		});
	};

	this.isDirty = function () {
		return !rootStack.isBookmark();
	};
	this.clearDirty = rootStack.bookmark;
}
