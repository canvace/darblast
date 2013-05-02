function RedoCommand() {
	Canvace.history.onCanRedo(function (can) {
		Ext.getCmp('redo-button').setDisabled(!can);
	});
	this.activate = function () {
		Canvace.history.redo();
		Canvace.renderer.render();
	};
}
