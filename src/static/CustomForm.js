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

Ext.define('Darblast.form.ErrorReader', {
	extend: 'Ext.data.reader.Reader',
	alias: 'reader.success',
	read: function () {
		return {
			success: true,
			records: null
		};
	}
});

function CustomForm(config) {
	config.errorReader = 'success';

	function makeCallback(original) {
		if (original) {
			return function (form, action) {
				var response;
				try {
					response = JSON.parse(action.response.responseText);
				} catch (e) {
					response = action.response.response;
				}
				original.call(form, response);
			};
		} else {
			return null;
		}
	}

	var success = makeCallback(config.success);
	delete config.success;

	var failure = makeCallback(config.failure || function (response) {
		Ext.MessageBox.show({
			title: 'Error',
			msg: response.toString(),
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.ERROR
		});
	});
	delete config.failure;

	var form = new Ext.form.Panel(config);

	var superSubmit = form.submit;
	form.submit = function (options) {
		if (form.getForm().isValid()) {
			if (!options) {
				options = {};
			}
			if (success) {
				options.success = success;
			}
			options.failure = failure;
			return superSubmit.call(form, options);
		}
	};

	return form;
}
