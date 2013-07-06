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
	var dialog = new Ext.window.Window({
		title: 'Full rendering',
		modal: false,
		resizable: true,
		width: 800,
		height: 600,
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
				// TODO
			}
		}
	}).show();
}
