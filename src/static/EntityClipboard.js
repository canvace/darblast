function EntityClipboard() {
	var entity = false;
	this.cut = function (instance) {
		entity = instance.getEntity();
		instance._delete();
	};
	this.copy = function (instance) {
		entity = instance.getEntity();
	};
	this.getEntity = function () {
		return entity;
	};
	this.paste = function (i, j, k) {
		if (entity !== false) {
			Canvace.instances.add(i, j, k, entity.getId());
		}
	};
}
