function Tiles(poller, view, images) {
	function Tile(Element, id, tile) {
		Element.call(this, id);

		this.isStatic = function () {
			return tile['static'];
		};
		this.setStatic = function (value) {
			var data = {};
			data['static'] = !!value;
			Canvace.Ajax.put('tiles/' + id, data);
		};

		this.isSolid = function () {
			return tile.solid;
		};
		this.setSolid = function (value) {
			Canvace.Ajax.put('tiles/' + id, {
				solid: !!value
			});
		};
	}

	Elements.call(this, 'tiles', Tile, poller, view, images);

	this.create = function (i0, j0, iSpan, jSpan) {
		Canvace.Ajax.post('tiles/', {
			layout: {
				i0: parseInt(i0, 10),
				j0: parseInt(j0, 10),
				iSpan: parseInt(iSpan, 10),
				jSpan: parseInt(jSpan, 10)
			}
		});
	};
}
