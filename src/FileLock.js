function FileLock() {
	var normalize = (function () {
		var cache = {};
		return function normalize(pathToNormalize, callback) {
			return fs.realpath(path.normalize(pathToNormalize), cache, callback);
		};
	}());

	var lock = new ReadWriteLock();

	this.readLock = function (path, callback) {
		normalize(path, function (error, path) {
			if (error) {
				callback(error);
			} else {
				lock.readLock(path, function (release) {
					callback(false, release);
				});
			}
		});
	};

	this.writeLock = function (path, callback) {
		normalize(path, function (error, path) {
			if (error) {
				callback(error);
			} else {
				lock.writeLock(path, function (release) {
					callback(false, release);
				});
			}
		});
	};
}
