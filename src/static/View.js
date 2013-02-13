function View(matrix, x0, y0) {
	var mat = matrix;
	var inv = (function () {
		var det = mat[0][0] * mat[1][1] * mat[2][2] +
			mat[0][1] * mat[1][2] * mat[2][0] +
			mat[0][2] * mat[1][0] * mat[2][1] -
			mat[0][2] * mat[1][1] * mat[2][0] -
			mat[0][1] * mat[1][0] * mat[2][2] -
			mat[0][0] * mat[1][2] * mat[2][1];
		return [
			[(mat[1][1] * mat[2][2] - mat[2][1] * mat[1][2]) / det,
				(mat[0][2] * mat[2][1] - mat[2][2] * mat[0][1]) / det,
				(mat[0][1] * mat[1][2] - mat[1][1] * mat[0][2]) / det],
			[(mat[1][2] * mat[2][0] - mat[2][2] * mat[1][0]) / det,
				(mat[0][0] * mat[2][2] - mat[2][0] * mat[0][2]) / det,
				(mat[0][2] * mat[1][0] - mat[1][2] * mat[0][0]) / det],
			[(mat[1][0] * mat[2][1] - mat[2][0] * mat[1][1]) / det,
				(mat[0][1] * mat[2][0] - mat[2][1] * mat[0][0]) / det,
				(mat[0][0] * mat[1][1] - mat[1][0] * mat[0][1]) / det]
		];
	}());

	this.project = function (i, j, k) {
		return [
			mat[0][0] * i + mat[0][1] * j + mat[0][2] * k,
			mat[1][0] * i + mat[1][1] * j + mat[1][2] * k,
			Math.round(mat[2][0] * i + mat[2][1] * j + mat[2][2] * k)
		];
	};
	this.projectElement = function (element, i, j, k) {
		return [
			mat[0][0] * i + mat[0][1] * j + mat[0][2] * k + element.offset.x,
			mat[1][0] * i + mat[1][1] * j + mat[1][2] * k + element.offset.y,
			Math.round(mat[2][0] * i + mat[2][1] * j + mat[2][2] * k)
		];
	};
	this.unproject = function (x, y, k) {
		var z = (k + inv[2][0] * (x0 - x) + inv[2][1] * (y0 - y)) / inv[2][2];
		var i = inv[0][0] * (x - x0) + inv[0][1] * (y - y0) + inv[0][2] * z;
		var j = inv[1][0] * (x - x0) + inv[1][1] * (y - y0) + inv[1][2] * z;
		return [i, j, k];
	};
	this.getCell = function (x, y, k) {
		var z = (k - inv[2][0] * (x - x0) - inv[2][1] * (y - y0)) / inv[2][2];
		var i = Math.floor(inv[0][0] * (x - x0) + inv[0][1] * (y - y0) + inv[0][2] * z);
		var j = Math.floor(inv[1][0] * (x - x0) + inv[1][1] * (y - y0) + inv[1][2] * z);
		return {
			i: i,
			j: j,
			k: k
		};
	};

	this.calculateBoxMetrics = (function () {
		var points = [
			[1, 0, 0],
			[0, 1, 0],
			[1, 1, 0],
			[0, 0, 1],
			[1, 0, 1],
			[0, 1, 1],
			[1, 1, 1]
		];
		return function (i, j, k) {
			var result = {
				left: 0,
				top: 0,
				right: 0,
				bottom: 0
			};
			for (var l in points) {
				var x = Math.round(mat[0][0] * points[l][0] * i + mat[0][1] * points[l][1] * j + mat[0][2] * points[l][2] * k);
				var y = Math.round(mat[1][0] * points[l][0] * i + mat[1][1] * points[l][1] * j + mat[1][2] * points[l][2] * k);
				result.left = Math.min(result.left, x);
				result.top = Math.min(result.top, y);
				result.right = Math.max(result.right, x);
				result.bottom = Math.max(result.bottom, y);
			}
			result.width = result.right - result.left + 1;
			result.height = result.bottom - result.top + 1;
			return result;
		};
	}());

	this.generateBox = (function () {
		var points = [
			[1, 0, 0],
			[0, 1, 0],
			[1, 1, 0],
			[0, 0, 1],
			[1, 0, 1],
			[0, 1, 1],
			[1, 1, 1]
		];
		return function (di, dj, dk, fill) {
			var canvas = document.createElement('canvas');
			var left = 0;
			var top = 0;
			var right = 0;
			var bottom = 0;
			for (var i in points) {
				var x = Math.round(mat[0][0] * points[i][0] * di + mat[0][1] * points[i][1] * dj + mat[0][2] * points[i][2] * dk);
				var y = Math.round(mat[1][0] * points[i][0] * di + mat[1][1] * points[i][1] * dj + mat[1][2] * points[i][2] * dk);
				left = Math.min(left, x);
				top = Math.min(top, y);
				right = Math.max(right, x);
				bottom = Math.max(bottom, y);
			}
			canvas.width = right - left + 1;
			canvas.height = bottom - top + 1;
			canvas.style.backgroundColor = 'white';
			var context = canvas.getContext('2d');
			context.translate(-left, -top);
			(function (drawLine) {
				var i, j, k;
				for (k = 0; k <= dk; k++) {
					for (i = 0; i <= di; i++) {
						drawLine(i, 0, k, i, dj, k);
					}
					for (j = 0; j <= dj; j++) {
						drawLine(0, j, k, di, j, k);
					}
				}
				for (i = 0; i <= di; i++) {
					for (j = 0; j <= dj; j++) {
						drawLine(i, j, 0, i, j, dk);
					}
				}
			})(function (i0, j0, k0, i1, j1, k1) {
				context.moveTo(
					mat[0][0] * i0 + mat[0][1] * j0 + mat[0][2] * k0,
					mat[1][0] * i0 + mat[1][1] * j0 + mat[1][2] * k0
					);
				context.lineTo(
					mat[0][0] * i1 + mat[0][1] * j1 + mat[0][2] * k1,
					mat[1][0] * i1 + mat[1][1] * j1 + mat[1][2] * k1
					);
			});
			if (fill) {
				context.fillStyle = 'blue';
				context.globalAlpha = 0.5;
				context.fill();
			} else {
				context.stroke();
			}
			return canvas;
		};
	}());

	this.getOrigin = function () {
		return {
			x: x0,
			y: y0
		};
	};
	this.drag = function (dx, dy) {
		x0 += dx;
		y0 += dy;
	};
}
