function History() {
	var stack = {};
	var pointer = -1;
	var top = -1;

	this.record = function (entry) {
		entry.action();
		stack[top = ++pointer] = entry;
	};

	this.canUndo = function () {
		return pointer >= 0;
	};

	this.canRedo = function () {
		return pointer < top;
	};

	this.undo = function () {
		if (pointer >= 0) {
			stack[pointer--].reverse();
			return true;
		} else {
			return false;
		}
	};

	this.redo = function () {
		if (pointer < top) {
			stack[++pointer].action();
			return true;
		} else {
			return false;
		}
	};
}
