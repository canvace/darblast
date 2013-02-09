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

	grunt.registerMultiTask('copy', 'Copies files and directories recursively.', function () {
		// TODO
	});

	grunt.registerTask('default', 'lint concat min copy');
};
