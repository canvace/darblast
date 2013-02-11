module.exports = function (grunt) {
	grunt.initConfig({
		lint: {
			dist: [
				'src/Begin.js',
				'src/End.js'
			]
		},
		jshint: {
			options: {
				camelcase: true,
				curly: true,
				immed: true,
				indent: 4,
				latedef: true,
				newcap: true,
				noarg: true,
				quotmark: 'single',
				undef: true,
				unused: true,
				strict: false,
				trailing: true,
				boss: true,
				debug: true,
				expr: true,
				loopfunc: true,
				multistr: true,
				smarttabs: true,
				supernew: true,
				node: true
			}
		},
		concat: {
			dist: {
				src: [
					'src/Begin.js',
					'src/End.js'
				],
				dest: 'src/canvace.js'
			}
		},
		min: {
			dist: {
				src: [
					'src/canvace.js'
				],
				dest: 'bin/canvace.js'
			}
		},
		copy: {
			dist: {
				src: [
					'src/static',
					'src/views'
				],
				dest: 'bin'
			}
		}
	});

	grunt.registerMultiTask('copy', 'Copies files and directories recursively.', (function () {
		var fs = require('fs');
		var path = require('path');
		return function () {
			if (typeof this.file.src === 'string') {
				this.file.src = [this.file.src];
			}
			for (var i in this.file.src) {
				(function process(itemPath, destPath) {
					var name = path.basename(itemPath);
					function removeOther() {
						(function remove(path) {
							if (fs.existsSync(path)) {
								var stat = fs.statSync(path);
								if (stat.isFile()) {
									fs.unlinkSync(path);
								} else if (stat.isDirectory()) {
									fs.readdirSync(path).forEach(function (subItem) {
										remove(path + '/' + subItem);
									});
									fs.rmdirSync(path);
								}
							}
						}(destPath + '/' + name));
					}
					var stat = fs.statSync(itemPath);
					var otherStat;
					try {
						otherStat = fs.statSync(destPath + '/' + name);
					} catch (e) {
						otherStat = null;
					}
					if (stat.isFile()) {
						if (!otherStat || (!otherStat.isFile() || (stat.mtime.getTime() > otherStat.mtime.getTime()))) {
							removeOther();
							fs.writeFileSync(destPath + '/' + name, fs.readFileSync(itemPath));
						}
					} else if (stat.isDirectory()) {
						if (!otherStat || (!otherStat.isDirectory() || (stat.mtime.getTime() > otherStat.mtime.getTime()))) {
							removeOther();
							fs.mkdirSync(destPath + '/' + name);
						}
						fs.readdirSync(itemPath).forEach(function (subItem) {
							process(itemPath + '/' + subItem, destPath + '/' + name);
						});
					}
				}(this.file.src[i], this.file.dest));
			}
		};
	}()));

	grunt.registerTask('default', 'lint concat min copy');
};
