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

/*global config: false, server: false */

(function (port) {
	if (!isFinite(port)) {
		port = 7104;
	}
	server.listen(port, function () {
		console.log('Canvace Development Environment running on port ' + port);
		if (!config.hasOwnProperty('browser') || config.browser !== false) {
			require('openurl').open('http://localhost:' + port + '/');
		}
	});
}(parseInt(config.port, 10)));
