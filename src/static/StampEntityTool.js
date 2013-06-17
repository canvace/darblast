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

function StampEntityTool() {
	this.activate = function () {
		var entityId = Canvace.entityControls.getSelectedId();
		if (typeof entityId !== 'undefined') {
			var entity = Canvace.entities.get(entityId);
			if (entity.hasFrames()) {
				var offset = entity.getOffset();
				Canvace.cursor
					.snap(false)
					.reset()
					.addElement(Canvace.images.getImage(entity.getFirstFrameId()), offset.x, offset.y)
					.show();
				Canvace.renderer.render();
			}
		}
	};
	this.deactivate = function () {
		Canvace.cursor.hide();
		Canvace.renderer.render();
	};
	this.mousemove = function (x, y) {
		Canvace.cursor.moveToXY(x, y);
		Canvace.renderer.render();
	};
	this.mouseup = function (x, y) {
		var id = Canvace.entityControls.getSelectedId();
		if (id !== false) {
			var k = Canvace.layers.getSelected();
			var p = Canvace.view.unproject(x, y, k);
			Canvace.instances.add(p[0], p[1], k, id);
			Canvace.renderer.render();
		}
	};
}
