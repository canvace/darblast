function Tiles(ready) {
	var deleteHandlers = new MultiSet();

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

		this.getLayout = function () {
			return Ext.Object.merge({}, tile.layout);
		};
	}

	Elements.call(this, 'tiles', Tile, ready);

	Canvace.poller.poll('tiles', 'delete', function (parameters) {
		deleteHandlers.fastForEach(function (handler) {
			handler(parameters.id);
		});
	});

	this.create = function (iSpan, jSpan, i0, j0) {
		Canvace.Ajax.post('tiles/', {
			layout: {
				ref: {
					i: parseInt(i0, 10),
					j: parseInt(j0, 10)
				},
				span: {
					i: parseInt(iSpan, 10),
					j: parseInt(jSpan, 10)
				}
			}
		});
	};

	this.onDelete = deleteHandlers.add;
}
