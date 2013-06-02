Ext.define('Darblast.ux.CheckboxWithTooltip', {
	extend: 'Ext.form.field.Checkbox',
	alias: 'widget.checkboxwithtooltip',
	constructor: function (config) {
		config = config || {};
		this.callParent([config]);
		if (config.tooltip) {
			var thisObject = this;
			var tooltip = null;
			this.addListener('render', function () {
				if (tooltip) {
					tooltip.close();
				}
				tooltip = new Ext.tip.ToolTip({
					target: thisObject.getEl(),
					html: config.tooltip
				});
			});
		}
	}
});
