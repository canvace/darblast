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
