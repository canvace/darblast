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

(function () {
	function sanitizeLabels(labels) {
		if (typeof labels === 'string') {
			labels = labels.split(',');
		}
		(function () {
			var additional = [];
			labels.filter(function (label) {
				var subLabels = label.split(',');
				if (subLabels.length > 1) {
					additional.push.apply(additional, subLabels);
					return false;
				} else {
					return true;
				}
			});
			labels.push.apply(labels, additional);
		}());
		var label;
		var set = {};
		for (var i in labels) {
			label = labels[i].toString().trim();
			if (label !== '') {
				if (/^\w+$/.test(label)) {
					set[label] = true;
				} else {
					throw 'One or more labels contain invalid characters';
				}
			}
		}
		var newArray = [];
		for (label in set) {
			newArray.push(label);
		}
		return newArray;
	}

	installHandler([
		'/images/',
		'/stages/:stageId/images/'
	], 'get', function (request, response) {
		this.images.globalReadLock(function (releaseImages) {
			this.readdir('images', function (ids) {
				var labelMap = {};
				if (ids.length) {
					var count = ids.length;
					ids.forEach(function (id) {
						this.images.individualReadLock(id, function (releaseImage) {
							this.getJSON('images/' + id + '/info', function (data) {
								releaseImage();
								labelMap[id] = data.labels;
								if (!--count) {
									releaseImages();
									response.json(labelMap);
								}
							});
						});
					}, this);
				} else {
					releaseImages();
					response.json({});
				}
			});
		});
	});

	installHandler([
		'/images/:imageId',
		'/stages/:stageId/images/:imageId'
	], 'get', function (request, response) {
		this.images.individualReadLock(request.params.imageId, function (release) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				this.readFile('images/' + request.params.imageId + '/data', function (data) {
					release();
					response.type(info.type).send(data);
				});
			});
		});
	});

	installHandler([
		'/images/',
		'/stages/:stageId/images/'
	], 'post', function (request, response) {
		/*
		 * XXX File upload responses end up in a hidden iframe. This MIME type
		 * is necessary or IE will ask the user to download the response.
		 */
		response.type('html');

		var labels;
		if ('labels' in request.body) {
			try {
				labels = sanitizeLabels(request.body.labels);
			} catch (e) {
				response.json(400, e.toString());
				return;
			}
		} else {
			labels = [];
		}

		var ids = [];

		function storeImage(file, id, callback) {
			this.images.globalWriteLock(function (releaseImages) {
				this.mkdir('images/' + id, function () {
					this.images.individualWriteLock(id, function (releaseImage) {
						releaseImages();
						this.putJSON('images/' + id + '/info', {
							refCount: 0,
							type: file.type,
							labels: labels
						}, function () {
							var handler = this;
							fs.readFile(file.path, function (error, data) {
								if (error) {
									handler.error();
								} else {
									handler.writeFile('images/' + id + '/data', data, function () {
										this.broadcast('images', 'create', {
											id: id,
											labels: labels
										});
										releaseImage();
										ids.push(id);
										callback.call(this);
									});
								}
							});
						});
					});
				});
			});
		}

		if (util.isArray(request.files.images)) {
			this.newIds('image', request.files.images.length, function (imageId) {
				var count = 0;
				for (var i in request.files.images) {
					count++;
					storeImage.call(this, request.files.images[i], imageId++, function () {
						if (!--count) {
							response.json(ids);
						}
					});
				}
			});
		} else {
			this.newIds('image', function (imageId) {
				storeImage.call(this, request.files.images, imageId, function () {
					response.json([imageId]);
				});
			});
		}
	});

	installHandler([
		'/images/:imageId',
		'/stages/:stageId/images/:imageId'
	], 'put', function (request, response) {
		this.images.individualWriteLock(request.params.imageId, function (release) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				info.labels = sanitizeLabels(request.body.labels);
				this.putJSON('images/' + request.params.imageId + '/info', info, function () {
					this.broadcast('images', 'update', {
						id: request.params.imageId,
						labels: info.labels
					});
					release();
					response.json(true);
				});
			});
		});
	});

	installHandler([
		'/images/:imageId',
		'/stages/:stageId/images/:imageId'
	], 'delete', function (request, response) {
		this.images.individualReadLock(request.params.imageId, function (releaseImage) {
			this.getJSON('images/' + request.params.imageId + '/info', function (info) {
				if (info.refCount > 0) {
					releaseImage();
					response.json(403, 'The image is still in use');
				} else {
					this.images.globalWriteLock(function (releaseImages) {
						this.deleteTree('images/' + request.params.imageId, function () {
							this.broadcast('images', 'delete', {
								id: request.params.imageId
							});
							releaseImage();
							releaseImages();
							response.json(true);
						});
					});
				}
			});
		});
	});
}());
