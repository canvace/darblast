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

function FullRendering() {
	var zoom = Ext.util.Cookies.get('full-rendering-zoom') || 100;
	var renderer;

	function render() {
		if (!renderer) {
			renderer = new FullRenderer(this.getEl().down('canvas.canvas').dom);
		}
		renderer.render(zoom / 100);
	}

	var dialog = new Ext.window.Window({
		title: 'Full rendering',
		modal: false,
		resizable: true,
		width: 800,
		height: 600,
		tbar: [{
			xtype: 'combobox',
			fieldLabel: 'Zoom',
			editable: false,
			store: [
				[100, '100%'],
				[95, '95%'],
				[90, '90%'],
				[85, '85%'],
				[80, '80%'],
				[75, '75%'],
				[70, '70%'],
				[65, '65%'],
				[60, '60%'],
				[55, '55%'],
				[50, '50%'],
				[45, '45%'],
				[40, '40%'],
				[35, '35%'],
				[30, '30%'],
				[25, '25%'],
				[20, '20%'],
				[15, '15%'],
				[10, '10%'],
				[5, '5%']
			],
			value: zoom,
			listeners: {
				change: function (field, value) {
					Ext.util.Cookies.set(
						'full-rendering-zoom',
						zoom = value,
						new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 365)
						);
					if (dialog) {
						render.bind(dialog)();
					}
				}
			}
		}],
		layout: 'fit',
		items: {
			xtype: 'box',
			autoEl: {
				tag: 'div',
				style: 'overflow: auto',
				children: [{
					tag: 'canvas',
					cls: 'canvas'
				}]
			}
		},
		buttons: [{
			text: 'Close',
			handler: function () {
				dialog.close();
			}
		}],
		listeners: {
			render: function () {
				render.bind(this)();
			}
		}
	}).show();
}
