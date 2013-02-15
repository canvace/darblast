module.exports = function (grunt) {
	grunt.initConfig({
		concat: {
			client: {
				src: [
					'src/static/MultiSet.js',
					'src/static/EventHandlers.js',
					'src/static/Hierarchy.js',
					'src/static/Canvace.js',
					'src/static/Poller.js',
					'src/static/Images.js',
					'src/static/Buckets.js',
					'src/static/View.js',
					'src/static/ToolGroup.js',
					'src/static/Tools.js',
					'src/static/Application.js'
				],
				dest: 'src/static/app.js'
			},
			server: {
				src: [
					'src/Prologue.js',
					'src/FileLock.js',
					'src/Handler.js',
					'src/Stage.js',
					'src/Images.js',
					'src/Epilogue.js'
				],
				dest: 'src/canvace.js'
			}
		},
		lint: {
			client: 'src/static/app.js',
			server: 'src/canvace.js'
		},
		jshint: {
			client: {
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
					browser: true
				},
				globals: {
					Ext: false
				}
			},
			server: {
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
			}
		},
		min: {
			client: {
				src: 'src/static/app.js',
				dest: 'bin/static/app.js'
			},
			server: {
				src: 'src/canvace.js',
				dest: 'bin/canvace.js'
			}
		},
		copy: {
			client: {
				src: [
					'src/static/extjs',
					'src/static/resources'
				],
				dest: 'bin/static'
			},
			client_debug: {
				src: [
					'src/static/extjs',
					'src/static/resources',
					'src/static/app.js'
				],
				dest: 'bin/static'
			},
			server: {
				src: 'src/views',
				dest: 'bin'
			},
			server_debug: {
				src: [
					'src/views',
					'src/canvace.js'
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

	grunt.registerTask('default', 'concat lint min copy:client copy:server');
	grunt.registerTask('debug', 'concat lint copy:client_debug copy:server_debug');
};
