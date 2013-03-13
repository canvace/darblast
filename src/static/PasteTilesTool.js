function PasteTilesTool() {
	var i0 = 0;
	var j0 = 0;
	this.activate = function () {
		var I = 0;
		var J = 0;
		var count = 0;
		Canvace.clipboard.forEach(function (i, j) {
			I += i;
			J += j;
			count++;
		});
		i0 = Math.round(I / count);
		j0 = Math.round(J / count);
	};
	this.mouseup = function (x, y) {
		var cell = Canvace.view.getCell(x, y, Canvace.layers.getSelected());
		Canvace.clipboard.paste(cell.i - i0, cell.j - j0);
	};
}
