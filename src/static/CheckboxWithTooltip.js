/*
 *	Canvace Visual Development Environment, codenamed "Darblast".
 *	Copyright (C) 2013  Canvace Srl  <http://www.canvace.com/>
 *
 *	Dual licensed under the MIT and GPLv3 licenses.
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
