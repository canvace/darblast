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

function Hierarchy(labelMap) {
	var sets = {};
	for (var id in labelMap) {
		for (var i in labelMap[id]) {
			if (!(labelMap[id][i] in sets)) {
				sets[labelMap[id][i]] = [];
			}
			sets[labelMap[id][i]].push(id);
		}
	}

	function contains(array1, array2) {
		if (array1.length >= array2.length) {
			for (var i in array2) {
				var matched = false;
				for (var j in array1) {
					if (array2[i] == array1[j]) {
						matched = true;
						break;
					}
				}
				if (!matched) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	}

	var partitions = {};
	var labels = {};
	for (var label1 in sets) {
		var name = label1;
		var labelsInPartition = [label1];
		for (var label2 in sets) {
			if ((label1 != label2) &&
				contains(sets[label1], sets[label2]) &&
				contains(sets[label2], sets[label1]))
			{
				labelsInPartition.push(label2);
				name += ', ' + label2;
				delete sets[label2];
			}
		}
		partitions[name] = sets[label1];
		labels[name] = labelsInPartition;
		delete sets[label1];
	}

	var containments = {};
	for (var name1 in partitions) {
		containments[name1] = [];
		for (var name2 in partitions) {
			if ((name1 != name2) && contains(partitions[name2], partitions[name1])) {
				containments[name1].push(name2);
			}
		}
	}

	var root = {};
	(function walk(node, path) {
		for (var name in containments) {
			if (contains(path, containments[name]) && contains(containments[name], path)) {
				var newPath = path.slice(0);
				newPath.push(name);
				walk(node[name] = {}, newPath);
			}
		}
	}(root, []));

	this.Root = function (name) {
		return new (function Node(name, node, inheritedLabels) {
			var allLabels = inheritedLabels.concat(labels[name] || []);
			this.getName = function () {
				return name;
			};
			this.getLabels = function () {
				return (name in labels) && labels[name].slice(0) || [];
			};
			this.getAllLabels = function () {
				return allLabels.slice(0);
			};
			this.hasChildren = function () {
				for (var name in node) {
					(function () {}(name)); // XXX silence linter
					return true;
				}
				return false;
			};
			this.forEachChild = function (callback) {
				for (var name in node) {
					callback(new Node(name, node[name], allLabels));
				}
			};
		})(name, root, []);
	};
}
