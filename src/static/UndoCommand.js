function UndoCommand() {
	Canvace.history.onCanUndo(function (can) {
		Ext.getCmp('undo-button').setDisabled(!can);
	});
	this.activate = function () {
		Canvace.history.undo();
		Canvace.renderer.render();
	};
}
