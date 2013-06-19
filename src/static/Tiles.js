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

function Tiles(ready) {
	function Tile(Element, id, tile) {
		id = parseInt(id, 10);
		Element.call(this, id);

		this.isStatic = function () {
			return tile.static;
		};
		this.setStatic = function (value) {
			var data = {};
			data.static = !!value;
			Canvace.Ajax.put('tiles/' + id, data);
		};

		this.isSolid = function () {
			return tile.solid;
		};
		this.setSolid = function (value) {
			Canvace.Ajax.put('tiles/' + id, {
				solid: !!value
			});
		};

		this.getLayout = function () {
			return Ext.Object.merge({}, tile.layout);
		};

		this.updateAfterReposition = function () {
			Canvace.array.updateRepositionedTile(id);
			Canvace.renderer.render();
		};
	}

	Elements.call(this, 'tiles', Tile, ready);

	this.create = function (iSpan, jSpan, i0, j0, firstFrameId, offset) {
		var data = {
			layout: {
				ref: {
					i: parseInt(i0, 10),
					j: parseInt(j0, 10)
				},
				span: {
					i: parseInt(iSpan, 10),
					j: parseInt(jSpan, 10)
				}
			}
		};
		if (arguments.length > 4) {
			data.firstFrameId = firstFrameId;
			data.offset = offset;
		}
		Canvace.Ajax.post('tiles/', data);
	};
}
