function Images() {
	var set = {};
	var hierarchy;

	Canvace.Ajax.get('images/all', function (labelMap) {
		for (var id in labelMap) {
			set[id] = {
				id: id,
				labels: labelMap[id],
				image: (function (id) {
					var image = new Image();
					image.addEventListener('load', function () {
						// TODO
					}, false);
					image.src = 'images/' + id;
					return image;
				}(id))
			};
		}
		hierarchy = new Hierarchy(labelMap);
	});

	this.getHierarchy = function () {
		return hierarchy;
	};

	new Poller('image', function () {
		// TODO
	});

	var objects = {};

	function ImageObject(id) {
		var data = set[id];
		this.getLabels = function () {
			return Ext.Object.merge({}, data.labels);
		};
		this.setLabels = function (labels, callback) {
			Canvace.Ajax.put('images/' + id + '/labels', labels, callback);
		};
		this._delete = function (callback) {
			Canvace.Ajax._delete('images/' + id, callback);
		};
	}

	this.forEach = function (callback) {
		for (var id in set) {
			callback(objects[id] || (objects[id] = new ImageObject(id)));
		}
	};
}
