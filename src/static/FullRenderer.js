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

function FullRenderer(canvas) {
	var first = true;
	var left, top, right, bottom;

	var sections = {};
	var minZ, maxZ;

	function processElement(element, i, j, k) {
		var frameId = element.getFirstFrameId();
		if (typeof frameId !== 'undefined') {
			var position = element.project(i, j, k);
			var dimensions = element.getDimensions();
			if (first) {
				left = position[0];
				top = position[1];
				right = position[0] + dimensions.width;
				bottom = position[1] + dimensions.height;
			} else {
				left = Math.min(left, position[0]);
				top = Math.min(top, position[1]);
				right = Math.max(right, position[0] + dimensions.width);
				bottom = Math.max(bottom, position[1] + dimensions.height);
			}
			if (!sections[position[2]]) {
				sections[position[2]] = new MultiSet();
			}
			sections[position[2]].add({
				id: frameId,
				x: position[0],
				y: position[1]
			});
			if (first) {
				minZ = maxZ = position[2];
			} else {
				minZ = Math.min(minZ, position[2]);
				maxZ = Math.max(maxZ, position[2]);
			}
			first = false;
		}
	}

	this.render = function () {
		Canvace.array.forEach(function (i, j, k, id) {
			processElement(Canvace.tiles.get(id), i, j, k);
		});
		Canvace.instances.forEach(function (instance) {
			var position = instance.getPosition();
			processElement(instance, position.i, position.j, position.k);
		});
		if (!first) {
			canvas.width = right - left + 1;
			canvas.height = bottom - top + 1;
			var context = canvas.getContext('2d');
			context.translate(-left, -top);
			for (var z = minZ; z <= maxZ; z++) {
				if (sections[z]) {
					sections[z].fastForEach(function (image) {
						context.drawImage(Canvace.images.getImage(image.id), image.x, image.y);
					});
				}
			}
		}
	};
}
