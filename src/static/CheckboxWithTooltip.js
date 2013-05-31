Ext.define('Darblast.ux.CheckboxWithTooltip', {
	extend: 'Ext.form.field.Checkbox',
	alias: 'widget.checkboxwithtooltip',
	constructor: function (config) {
		config = config || {};
		this.callParent([config]);
		if (config.tooltip) {
			new Ext.tip.ToolTip({
				target: this.getEl(),
				html: config.tooltip
			});
		}
	}
});
