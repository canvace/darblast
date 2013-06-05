function DragTracker(target, handler) {
	var handlers = new EventHandlers();

	var dragging = false;
	var x0, y0;

	handler.addEventListener('mousedown', function (event) {
		handlers.fire('start');
		dragging = true;
		x0 = event.clientX;
		y0 = event.clientY;
		event.preventDefault();
	}, false);

	handler.addEventListener('mousemove', function (event) {
		if (dragging) {
			target.style.left = (target.offsetLeft + event.clientX - x0) + 'px';
			target.style.top = (target.offsetTop + event.clientY - y0) + 'px';
			x0 = event.clientX;
			y0 = event.clientY;
			event.preventDefault();
		}
	}, false);

	handler.addEventListener('mouseup', function (event) {
		if (dragging) {
			dragging = false;
			event.preventDefault();
			handlers.fire('end', function (handler) {
				handler(target.offsetLeft, target.offsetTop);
			});
		}
	}, false);

	this.onDragStart = function (handler) {
		return handler.registerHandler('start', handler);
	};
	this.onDragEnd = function (handler) {
		return handlers.registerHandler('end', handler);
	};
}
