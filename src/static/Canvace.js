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

var Canvace = (function () {
	var initHandlers = [];
	var thisObject = function (initHandler) {
		initHandlers.push(initHandler);
	};
	thisObject.init = function (components) {
		for (var i in initHandlers) {
			initHandlers[i](components);
		}
	};

	(function () {
		function bindAjax(method) {
			return function (url, data, callback) {
				var hasData;
				if (arguments.length < 2) {
					hasData = false;
				} else if (arguments.length < 3) {
					if (typeof data !== 'function') {
						hasData = true;
					} else {
						callback = data;
						hasData = false;
					}
				} else {
					hasData = true;
				}
				var settings = {
					url: url,
					method: method,
					success: function (response) {
						callback && callback(JSON.parse(response.responseText));
					},
					failure: function (response) {
						Ext.MessageBox.show({
							title: 'Error',
							msg: JSON.parse(response.responseText).toString(),
							buttons: Ext.MessageBox.OK,
							icon: Ext.MessageBox.ERROR
						});
					}
				};
				if (hasData) {
					if (method !== 'GET') {
						settings.jsonData = data;
					} else {
						settings.params = data;
					}
				}
				Ext.Ajax.request(settings);
			};
		}
		thisObject.Ajax = {
			get: bindAjax('GET'),
			post: bindAjax('POST'),
			put: bindAjax('PUT'),
			_delete: bindAjax('DELETE')
		};
	}());

	return thisObject;
}());
