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

function Entities(ready) {
	function Entity(Element, id, entity) {
		id = parseInt(id, 10);
		Element.call(this, id);

		this.hasPhysics = function () {
			return entity.hasPhysics;
		};
		this.setPhysics = function (enabled) {
			Canvace.Ajax.put('entities/' + id, {
				hasPhysics: !!enabled
			});
		};

		this.getBoundingBox = function () {
			Ext.Object.merge({}, entity.box);
		};
		this.setBoundingBox = function (boundingBox) {
			Canvace.Ajax.put('entities/' + id, {
				box: {
					i0: parseFloat(boundingBox.i0),
					j0: parseFloat(boundingBox.j0),
					iSpan: parseFloat(boundingBox.iSpan),
					jSpan: parseFloat(boundingBox.jSpan)
				}
			});
		};

		// XXX this is for the LowerControls class
		this.getLayout = function () {
			return {
				span: {
					i: 1,
					j: 1
				},
				ref: {
					i: 0,
					j: 0
				}
			};
		};

		this.updateAfterReposition = function () {
			Canvace.instances.updateRepositionedEntity(id);
			Canvace.renderer.render();
		};
	}

	Elements.call(this, 'entities', Entity, ready);

	this.create = function (firstFrameId, offset) {
		if (arguments.length) {
			Canvace.Ajax.post('entities/', {
				offset: offset,
				firstFrameId: firstFrameId
			});
		} else {
			Canvace.Ajax.post('entities/');
		}
	};
}
