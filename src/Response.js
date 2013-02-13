function JSONResponse(response) {
	this.getJSON = function (path, callback) {
		fs.readFile(path, 'ascii', function (error, content) {
			if (error) {
				response.type('json').send(404, error.toString());
			} else {
				var data;
				try {
					data = JSON.parse(content);
				} catch (e) {
					response.type('json').send(404, e.toString());
					return;
				}
				callback(data);
			}
		});
	};

	this.getJSONSync = function (path) {
		try {
			return JSON.parse(fs.readFileSync(path, 'ascii'));
		} catch (e) {
			response.type('json').send(404, e.toString());
		}
	};

	this.putJSON = function (path, data, callback) {
		fs.writeFile(path, JSON.stringify(data), function (error) {
			if (error) {
				response.type('json').send(404);
			} else {
				callback();
			}
		});
	};

	this.putJSONSync = function (path, data) {
		try {
			fs.writeFileSync(path, JSON.stringify(data), 'ascii');
		} catch (e) {
			response.type('json').send(404, e.toString());
		}
	};

	this.send = function (data) {
		response.json(data);
	};
}

function installJSONHandler(urls, method, handler) {
	if (typeof urls === 'string') {
		urls = [urls];
	}
	for (var i in urls) {
		app[method](urls[i], function (request, response) {
			handler(request, new JSONResponse(response));
		});
	}
}
