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

function ToolGroup(tools) {
	if (tools.length < 1) {
		throw 'invalid tool array';
	}

	var group;
	var selectedToolIndex = 0;

	return group = new Ext.button.Split({
		toggleGroup: 'tool',
		allowDepress: false,
		scale: 'large',
		icon: tools[selectedToolIndex].icon,
		tooltip: tools[selectedToolIndex].text,
		menuAlign: 'tl-tr?',
		menu: {
			hideMode: 'display',
			items: tools.map(function (tool, index) {
				return {
					text: tool.text,
					icon: tool.icon,
					handler: function () {
						selectedToolIndex = index;
						group.setIcon(tool.icon).setTooltip(tool.text).toggle(true);
						if (tool.handler) {
							tool.handler();
						}
					}
				};
			})
		},
		toggleHandler: function (button, state) {
			if (state) {
				if (('handler' in tools[selectedToolIndex]) && (tools[selectedToolIndex].handler() === false)) {
					// TODO reselect previous tool
				}
			}
		}
	});
}
