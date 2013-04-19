function UndoCommand() {
	Canvace.history.onCanUndo(function (can) {
		Ext.getCmp('undo-button').setDisabled(!can);
	});
	this.activate = Canvace.history.undo;
}
