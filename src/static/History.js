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
		// FIXME what if we are currently nesting?
		// TODO only erase the sub-stack
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
