function LowerControls(container, name) {
	var handlers = new EventHandlers();

	function bindOn(key) {
		return function (handler) {
			return handlers.registerHandler(key, handler);
		};
	}

	this.onAddElement = bindOn('element/add');
	this.onActivateElement = bindOn('element/activate');
	this.onDeleteElement = bindOn('element/delete');
	this.onAddCategory = bindOn('category/add');
	this.onDeleteCategory = bindOn('category/delete');

	var view = Ext.create('Ext.view.View', {
		id: 'view',
		region: 'center',
		store: [],
		tpl: [
			'<tpl for=".">',
			'	<div class="thumb-wrap" id="{imageId}">',
			'		<div class="thumb"><img src="images/{imageId}"></div>',
			'	</div>',
			'</tpl>',
			'<div class="x-clear"></div>'
		],
		multiSelect: true,
		trackOver: true,
		overItemCls: 'x-item-over',
		itemSelector: 'div.thumb-wrap',
		emptyText: 'No images',
		plugins: [
			Ext.create('Ext.ux.DataView.DragSelector', {})
		],
		listeners: {
			itemdblclick: function (view, model) {
				handlers.fire('element/activate', function (handler) {
					handler(model.get('id'));
				});
			}
		}
	});
	var store = view.getStore();
	var selection = view.getSelectionModel();

	container.add({
		title: name,
		items: view
	});

	this.addElement = function (id, labels, imageId) {
		store.add({
			id: id,
			labels: labels,
			imageId: imageId
		});
	};

	this.hasSelection = function () {
		return selection.hasSelection();
	};

	this.getSelectedId = function () {
		if (selection.hasSelection()) {
			return selection.getLastSelected().get('id');
		}
	};

	this.getSelectedIds = function () {
		return selection.getSelection().map(function (model) {
			return model.get('id');
		});
	};
}
