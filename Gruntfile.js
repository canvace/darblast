module.exports = function (grunt) {

	grunt.initConfig({

		clean: {
			all: ['bin']
		},

		concat: {
			client: {
				src: [
					'src/static/Normalize.js',
					'src/static/MultiSet.js',
					'src/static/EventHandlers.js',
					'src/static/Projection.js',
					'src/static/Hierarchy.js',
					'src/static/Canvace.js',
					'src/static/Loader.js',
					'src/static/Poller.js',
					'src/static/CustomForm.js',
					'src/static/PropertyControls.js',
					'src/static/LowerControls.js',
					'src/static/Images.js',
					'src/static/ImageControls.js',
					'src/static/Elements.js',
					'src/static/Tiles.js',
					'src/static/TileControls.js',
					'src/static/Entities.js',
					'src/static/EntityControls.js',
					'src/static/Stages.js',
					'src/static/StageControls.js',
					'src/static/View.js',
					'src/static/Buckets.js',
					'src/static/History.js',
					'src/static/TileArray.js',
					'src/static/Instances.js',
					'src/static/Layers.js',
					'src/static/Selection.js',
					'src/static/TileClipboard.js',
					'src/static/EntityClipboard.js',
					'src/static/Cursor.js',
					'src/static/Renderer.js',
					'src/static/ToolGroup.js',
					'src/static/UndoCommand.js',
					'src/static/RedoCommand.js',
					'src/static/DragTool.js',
					'src/static/StampTileTool.js',
					'src/static/StampEntityTool.js',
					'src/static/FillAreaTool.js',
					'src/static/FillSelectionCommand.js',
					'src/static/MoveEntityTool.js',
					'src/static/EraseTilesTool.js',
					'src/static/EraseEntitiesTool.js',
					'src/static/WipeTilesCommand.js',
					'src/static/DragSelectTool.js',
					'src/static/FloodSelectTool.js',
					'src/static/CopyEntitiesTool.js',
					'src/static/CopyTilesCommand.js',
					'src/static/CutEntitiesTool.js',
					'src/static/CutTilesCommand.js',
					'src/static/PasteEntityTool.js',
					'src/static/PasteTilesTool.js',
					'src/static/Tools.js',
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
						Ext: true
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
			client: {
				files: {
					'bin/static/app.js': 'src/static/app.js'
				}
			},

			server: {
				files: {
					'bin/canvace.js': 'src/canvace.js'
				}
			}
		},

		copy: {
			client: {
				files: [
					{ expand: true, cwd: 'src/static/resources/', src: ['**'], dest: 'bin/static/resources/' },
					{ expand: true, cwd: 'src/static/extjs/', src: ['**'], dest: 'bin/static/extjs/' }
				]
			},

			client_debug: {
				files: [
					{ expand: true, cwd: 'src/static/resources/', src: ['**'], dest: 'bin/static/resources/' },
					{ expand: true, cwd: 'src/static/extjs/', src: ['**'], dest: 'bin/static/extjs/' },
					{ src: ['src/static/app.js'], dest: 'bin/static/' }
				]
			},

			server: {
				files: [
					{ expand: true, cwd: 'src/views/', src: ['**'], dest: 'bin/views/' }
				]
			},

			server_debug: {
				files: [
					{ expand: true, cwd: 'src/views/', src: ['**'], dest: 'bin/views/' },
					{ src: ['src/canvace.js'], dest: 'bin/' }
				]
			}
		}
	});

	// Load task handlers
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Register tasks
	grunt.registerTask('default', ['clean', 'concat', 'jshint', 'uglify', 'copy:client', 'copy:server']);
	grunt.registerTask('debug', ['clean', 'concat', 'jshint', 'copy:client_debug', 'copy:server_debug']);

};
