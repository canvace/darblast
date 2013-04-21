function Projection() {
	var matrix = (function (getValue) {
		var matrix = [];
		for (var i = 0; i < 3; i++) {
			matrix[i] = [];
			for (var j = 0; j < 3; j++) {
				matrix[i][j] = getValue(i, j);
			}
		}
		return matrix;
	}(function (i, j) {
		return parseFloat(Ext.getCmp('matrix-field-' + (i + 1) + '' + (j + 1)).getValue());
	}));

	var context = Ext.getDom('projection-canvas').getContext('2d');
	context.setTransform(1, 0, 0, 1, 75, 75);
	context.fillStyle = '#FFFFFF';

	function repaint(updateGrippers) {
		if (typeof updateGrippers === 'undefined') {
			updateGrippers = true;
		}

		function drawAxis(i, j, k) {
			context.moveTo(0, 0);
			var x = i * matrix[0][0] + j * matrix[0][1] + k * matrix[0][2];
			var y = i * matrix[1][0] + j * matrix[1][1] + k * matrix[1][2];
			var m = y / x;
			if (y > x) {
				if (x && (m >= -1) && (m <= 1)) {
					context.lineTo(-75, y * -75 / x);
				} else {
					context.lineTo(x * 75 / y, 75);
				}
			} else {
				if (x && (m >= -1) && (m <= 1)) {
					context.lineTo(75, y * 75 / x);
				} else {
					context.lineTo(x * -75 / y, -75);
				}
			}
		}

		function drawLine(i0, j0, k0, i1, j1, k1) {
			context.moveTo(
				i0 * matrix[0][0] + j0 * matrix[0][1] + k0 * matrix[0][2],
				i0 * matrix[1][0] + j0 * matrix[1][1] + k0 * matrix[1][2]
				);
			context.lineTo(
				i1 * matrix[0][0] + j1 * matrix[0][1] + k1 * matrix[0][2],
				i1 * matrix[1][0] + j1 * matrix[1][1] + k1 * matrix[1][2]
				);
		}

		context.fillRect(-75, -75, 150, 150);
		context.beginPath();
		context.lineWidth = 1;
		drawAxis(1, 0, 0);
		drawAxis(0, 1, 0);
		drawAxis(0, 0, 1);
		context.stroke();
		context.lineWidth = 0.5;
		drawLine(0, 0, 0, 1, 0, 0);
		drawLine(0, 0, 0, 0, 1, 0);
		drawLine(1, 0, 0, 1, 1, 0);
		drawLine(0, 1, 0, 1, 1, 0);
		drawLine(0, 0, 1, 1, 0, 1);
		drawLine(0, 0, 1, 0, 1, 1);
		drawLine(1, 0, 1, 1, 1, 1);
		drawLine(0, 1, 1, 1, 1, 1);
		drawLine(0, 0, 0, 0, 0, 1);
		drawLine(1, 0, 0, 1, 0, 1);
		drawLine(0, 1, 0, 0, 1, 1);
		drawLine(1, 1, 0, 1, 1, 1);
		context.stroke();

		if (updateGrippers) {
			['i', 'j', 'k'].forEach(function (axis) {
				var component = Ext.getCmp('projection-gripper-' + axis);
				component.showAt(
					67 + matrix[0][component.matrixColumn],
					67 + matrix[1][component.matrixColumn]);
			});
		}
	}

	(function (bindBlur) {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				Ext.getCmp('matrix-field-' + (i + 1) + '' + (j + 1)).on('blur', bindBlur(i, j));
			}
		}
	})(function (i, j) {
		return function () {
			matrix[i][j] = parseFloat(this.getValue());
			repaint();
		};
	});

	['i', 'j', 'k'].forEach(function (axis) {
		Ext.getCmp('projection-gripper-' + axis).on('move', function (self) {
			var p = self.getPosition(true);
			var c = self.matrixColumn;
			Ext.getCmp('matrix-field-1' + (c + 1)).setValue(matrix[0][c] = -67 + p[0]);
			Ext.getCmp('matrix-field-2' + (c + 1)).setValue(matrix[1][c] = -67 + p[1]);
			repaint(false);
		});
	});

	this.getMatrix = function () {
		return matrix;
	};

	this.update = function (newMatrix) {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				Ext.getCmp('matrix-field-' + (i + 1) + '' + (j + 1)).setValue(matrix[i][j] = newMatrix[i][j]);
			}
		}
		repaint();
	};

	repaint();
}
