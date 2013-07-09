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

/*global exports: false */

exports.initGUI = function () {
	var dialog = (new Ext.window.Window({
		title: 'Export Wizard',
		resizable: false,
		width: 400,
		modal: true,
		layout: 'fit',
		buttons: [{
			text: 'Close',
			handler: function () {
				dialog.close();
			}
		}],
		items: {
			xtype: 'container',
			layout: {
				type: 'accordion',
				animate: true,
				multi: false
			},
			items: [{
				title: 'Store to backend',
				html: 'blah blah blah'
			}, {
				title: 'Download to frontend',
				html: 'trololololol'
			}]
		}
	})).show();
};
