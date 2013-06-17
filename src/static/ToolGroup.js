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

function ToolGroup(icon, tooltip, tools) {
	if (tools.length < 1) {
		throw 'invalid tool array';
	}

	var group;
	var selectedToolIndex = 0;

	var items = [];
	for (var i in tools) {
		items.push({
			text: tools[i].text,
			icon: tools[i].icon,
			handler: (function (i) {
				return function () {
					selectedToolIndex = i;
					group.setIcon(tools[i].icon).setTooltip(tools[i].text).toggle(true);
					if (tools[i].handler) {
						tools[i].handler();
					}
				};
			}(parseInt(i, 10)))
		});
	}

	return group = new Ext.button.Split({
		toggleGroup: 'tool',
		allowDepress: false,
		scale: 'large',
		icon: icon,
		tooltip: tooltip,
		menuAlign: 'tl-tr?',
		menu: {
			hideMode: 'display',
			items: items
		},
		toggleHandler: function (button, state) {
			if (state) {
				if (('activate' in tools[selectedToolIndex]) && (tools[selectedToolIndex].activate() === false)) {
					// TODO reselect previous tool
				}
			}
		}
	});
}
