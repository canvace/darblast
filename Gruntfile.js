module.exports = function (grunt) {
	grunt.initConfig({
		clean: {
			all: ['bin']
		},

		concat: {
			client: {
				src: [
					'src/static/DirectoryTree.js',
					'src/static/ExportWizard.js',
					'src/static/Application.js'
				],
				dest: 'src/static/app.js'
			},
			server: {
				src: [
					'src/Prologue.js',
					'src/SessionlessHandler.js',
					'src/Main.js',
					'src/FileLock.js',
					'src/Handler.js',
					'src/Images.js',
					'src/Tiles.js',
					'src/Entities.js',
					'src/Stages.js',
					'src/Epilogue.js'
				],
				dest: 'src/canvace.js'
			}
		},

		lineending: {
			dist: {
				options: {
					eol: 'lf'
				},
				files: {
					'bin/canvace.js': ['bin/canvace.js']
				}
			}
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
					browser: true,
					globals: {
						Ext: false,
						Darblast: false
					}
				},
				files: {
					src: ['src/static/app.js']
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
				},
				files: {
					src: ['src/canvace.js']
				}
			}
		},

		uglify: {
			options: {
				wrap: 'exports',
				report: 'min',
				preserveComments: false
			},
			client: {
				files: {
					'bin/static/app.js': ['src/static/app.js']
				}
			},
			server: {
				options: {
					banner: '#!/usr/bin/env node\n'
				},
				files: {
					'bin/canvace.js': ['src/canvace.js']
				}
			}
		},

		copy: {
			client: {
				files: [{
					expand: true,
					cwd: 'src/static/resources/',
					src: ['**'],
					dest: 'bin/static/resources/'
				}, {
					expand: true,
					cwd: 'src/static/extjs/',
					src: ['**'],
					dest: 'bin/static/extjs/'
				}]
			},
			client_debug: {
				files: [{
					expand: true,
					cwd: 'src/static/resources/',
					src: ['**'],
					dest: 'bin/static/resources/'
				}, {
					expand: true,
					cwd: 'src/static/extjs/',
					src: ['**'],
					dest: 'bin/static/extjs/'
				}, {
					expand: true,
					cwd: 'src/static/',
					src: ['app.js'],
					dest: 'bin/static/'
				}]
			},
			server: {
				files: [{
					expand: true,
					cwd: 'src/views/',
					src: ['**'],
					dest: 'bin/views/'
				}]
			},
			server_debug: {
				files: [{
					expand: true,
					cwd: 'src/views/',
					src: ['**'],
					dest: 'bin/views/'
				}, {
					expand: true,
					cwd: 'src/',
					src: ['canvace.js'],
					dest: 'bin/'
				}]
			}
		}
	});

	// Load task handlers
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-lineending');

	// Register tasks
	grunt.registerTask('default', [
		'concat:client', 'concat:server',
		'jshint',
		'uglify',
		'lineending:dist',
		'copy:client', 'copy:server'
	]);
	grunt.registerTask('debug', [
		'concat:client', 'concat:server',
		'jshint',
		'copy:client_debug', 'copy:server_debug'
	]);
};
