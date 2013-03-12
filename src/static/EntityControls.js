function EntityControls() {
	var controls = new LowerControls('Entities', 2);

	controls.onAddElement(Canvace.entities.create);

	function addEntity(entity) {
		var id = entity.getId();
		controls.addElement(id, entity.getLabels(), entity.getFirstFrameId());
		entity.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.entities.forEach(addEntity);
	Canvace.entities.onCreate(addEntity);

	this.hasSelection = controls.hasSelection;
	this.getSelectedId = controls.getSelectedId;
	this.getSelectedIds = controls.getSelectedIds;
}
