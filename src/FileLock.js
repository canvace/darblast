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

function FileLock() {
	var normalize = (function () {
		var cache = {};
		return function (pathToNormalize, callback) {
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
