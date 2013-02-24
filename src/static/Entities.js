function Entities(ready) {
	function Entity(Element, id, entity) {
		Element.call(this, id);

		this.hasPhysics = function () {
			return entity.hasPhysics;
		};
		this.setPhysics = function (enabled) {
			Canvace.Ajax.put('entities/' + id, {
				hasPhysics: !!enabled
			});
		};

		this.getBoundingBox = function () {
			Ext.Object.merge({}, entity.box);
		};
		this.setBoundingBox = function (boundingBox) {
			Canvace.Ajax.put('entities/' + id, {
				box: {
					i0: parseFloat(boundingBox.i0),
					j0: parseFloat(boundingBox.j0),
					iSpan: parseFloat(boundingBox.iSpan),
					jSpan: parseFloat(boundingBox.jSpan)
				}
			});
		};
	}

	Elements.call(this, 'entities', Entity, ready);

	this.create = function () {
		Canvace.Ajax.post('entities/');
	};
}
