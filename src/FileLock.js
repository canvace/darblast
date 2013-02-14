var fileLock = new (function () {
	var normalize = (function () {
		var cache = {};
		return function normalize(path, callback) {
			return fs.realpathSync(path, cache, callback);
		};
	}());

	var lock = new ReadWriteLock();

	this.readLock = function (path, callback) {
		normalize(path, function (path) {
			lock.readLock(path, callback);
		});
	};

	this.writeLock = function (path, callback) {
		normalize(path, function (path) {
			lock.writeLock(path, callback);
		});
	};
})();
