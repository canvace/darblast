function RedoCommand() {
	Canvace.history.onCanRedo(function (can) {
		Ext.getCmp('redo-button').setDisabled(!can);
	});
	this.activate = Canvace.history.redo;
}
