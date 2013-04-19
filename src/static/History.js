function History() {
	var stack = {};
	var pointer = -1;
	var top = -1;
	var savedRevision = -1;
	var dirtyAnyway = false;

	var canUndoHandlers = new EventHandlers();
	var canRedoHandlers = new EventHandlers();

	this.record = function (entry) {
		stack[top = ++pointer] = entry;
		canUndoHandlers.fire(0, function (handler) {
			handler(true);
		});
		canRedoHandlers.fire(0, function (handler) {
			handler(false);
		});
	};

	this.canUndo = function () {
		return pointer >= 0;
	};
	this.canRedo = function () {
		return pointer < top;
	};
	this.onCanUndo = function (handler) {
		return canUndoHandlers.registerHandler(0, handler);
	};
	this.onCanRedo = function (handler) {
		return canRedoHandlers.registerHandler(0, handler);
	};

	this.undo = function () {
		if (pointer >= 0) {
			stack[pointer--].reverse();
			if (!pointer) {
				canUndoHandlers.fire(0, function (handler) {
					handler(false);
				});
			}
			canRedoHandlers.fire(0, function (handler) {
				handler(true);
			});
			return true;
		} else {
			return false;
		}
	};
	this.redo = function () {
		if (pointer < top) {
			stack[++pointer].action();
			canUndoHandlers.fire(0, function (handler) {
				handler(true);
			});
			if (pointer >= top) {
				canRedoHandlers.fire(0, function (handler) {
					handler(false);
				});
			}
			return true;
		} else {
			return false;
		}
	};

	this.erase = function () {
		stack = {};
		pointer = top = savedRevision = -1;
		dirtyAnyway = true;
		canUndoHandlers.fire(0, function (handler) {
			handler(false);
		});
		canRedoHandlers.fire(0, function (handler) {
			handler(false);
		});
	};

	this.isDirty = function () {
		return (savedRevision != pointer) || dirtyAnyway;
	};
	this.clearDirty = function () {
		savedRevision = pointer;
		dirtyAnyway = false;
	};
}
