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

function Renderer() {
	var canvas = Ext.getDom('canvas');
	var width = canvas.width;
	var height = canvas.height;

	var context = canvas.getContext('2d');
	context.fillStyle = '#FFFFFF';
	context.strokeStyle = '#555555';

	function drawGrid(origin) {
		context.setTransform(1, 0, 0, 1, origin.x, origin.y);
		var k = Canvace.layers.getSelected();
		var points = [
			Canvace.view.unproject(0, 0, k),
			Canvace.view.unproject(width, 0, k),
			Canvace.view.unproject(0, height, k),
			Canvace.view.unproject(width, height, k)
		];
		var minI = Math.round(Math.min(points[0][0], points[1][0], points[2][0], points[3][0])) - 1;
		var maxI = Math.round(Math.max(points[0][0], points[1][0], points[2][0], points[3][0])) + 1;
		var minJ = Math.round(Math.min(points[0][1], points[1][1], points[2][1], points[3][1])) - 1;
		var maxJ = Math.round(Math.max(points[0][1], points[1][1], points[2][1], points[3][1])) + 1;
		function drawLine(i1, j1, i2, j2) {
			var p1 = Canvace.view.project(i1, j1, k);
			var p2 = Canvace.view.project(i2, j2, k);
			context.moveTo(p1[0], p1[1]);
			context.lineTo(p2[0], p2[1]);
		}
		context.beginPath();
		context.lineWidth = 1;
		drawLine(minI, 0, maxI, 0);
		drawLine(0, minJ, 0, maxJ);
		context.stroke();
		context.lineWidth = 0.5;
		for (var i = minI; i <= maxI; i++) {
			if (i) {
				drawLine(i, minJ, i, maxJ);
			}
		}
		for (var j = minJ; j <= maxJ; j++) {
			if (j) {
				drawLine(minI, j, maxI, j);
			}
		}
		context.stroke();
	}

	var layerTransparency = true;
	var showGrid = true;

	var selectionFragment = Canvace.view.generateTileHighlight();
	var metrics = Canvace.view.calculateBoxMetrics(1, 1, 0);

	function render() {
		context.globalAlpha = 1;
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillRect(0, 0, width, height);
		var origin = Canvace.view.getOrigin();
		if (showGrid) {
			drawGrid(origin);
		}
		context.setTransform(1, 0, 0, 1, origin.x, origin.y);
		if (layerTransparency) {
			var selectedLayer = Canvace.layers.getSelected();
			Canvace.buckets.forEach(origin.x, origin.y, function (element) {
				if (Canvace.layers.isOn(element.k)) {
					if (element.k != selectedLayer) {
						context.globalAlpha = 0.5;
					} else {
						context.globalAlpha = 1;
					}
					context.drawImage(Canvace.images.getImage(element.id, render), element.x, element.y);
				}
			});
		} else {
			context.globalAlpha = 1;
			Canvace.buckets.forEach(origin.x, origin.y, function (element) {
				if (Canvace.layers.isOn(element.k)) {
					context.drawImage(Canvace.images.getImage(element.id, render), element.x, element.y);
				}
			});
		}
		Canvace.selection.forEach(function (i, j, k) {
			var p = Canvace.view.project(i, j, k);
			context.drawImage(selectionFragment, p[0] + metrics.left, p[1] + metrics.top);
		});
		Canvace.cursor.draw(context);
	}

	this.render = render;

	this.toggleGrid = function (on) {
		showGrid = !!on;
		render();
	};
	this.toggleTransparency = function (on) {
		layerTransparency = !!on;
		render();
	};
}
