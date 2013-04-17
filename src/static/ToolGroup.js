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
		menu: items,
		toggleHandler: function (button, state) {
			if (state) {
				if (('activate' in tools[selectedToolIndex]) && (tools[selectedToolIndex].activate() === false)) {
					// TODO reselect previous tool
				}
			}
		}
	});
}
