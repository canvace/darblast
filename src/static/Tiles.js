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

	return Elements.call(this, 'tiles', Tile, poller, view, images);
}
