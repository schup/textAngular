module.exports = function (grunt) {
	
	// load all grunt tasks
	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);
	/*
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-istanbul-coverage');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-karma-coveralls');
	*/
	
	// Default task.
	grunt.registerTask('default', ['uglify', 'clean:coverage', 'test']);
	grunt.registerTask('test', ['jshint', 'karma', 'coverage']);
	grunt.registerTask('travis-test', ['jshint', 'karma', 'coverage', 'coveralls']);
	
	var testConfig = function (configFile, customOptions) {
		var options = { configFile: configFile, keepalive: true };
		var travisOptions = process.env.TRAVIS && { browsers: ['PhantomJS'], reporters: ['dots','coverage'] };
		return grunt.util._.extend(options, customOptions, travisOptions);
	};
	
	// Project configuration.
	grunt.initConfig({
		clean: {
			coverage: {
				files: ["coverage/*"]
			},
			dist: {
				files: [
					{
						dot: true,
						src: [
							'.tmp',
							'<%= yeoman.dist %>/{,*/}*',
							'!<%= yeoman.dist %>/.git*'
						]
					}
				]
			},
			server: '.tmp'
		},
		//clean: ["coverage/*"],
		coverage: {
		  options: {
		  	thresholds: {
			  'statements': 100,
			  'branches': 100,
			  'lines': 100,
			  'functions': 100
			},
			dir: ''
		  }
		},
		coveralls: {
			options: {
				debug: true,
				coverage_dir: 'coverage',
				force: true
			}
		},
		karma: {
		  jquery: {
			options: testConfig('karma-jquery.conf.js')
		  },
		  jqlite: {
			options: testConfig('karma-jqlite.conf.js')
		  }
		},
		jshint: {
		  files: ['src/textAngular.js', 'src/textAngularSetup.js', 'test/*.spec.js'],// don't hint the textAngularSanitize as they will fail
		  options: {
			eqeqeq: true,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			sub: true,
			boss: true,
			eqnull: true,
			globals: {}
		  }
		},
		uglify: {
			options: {
				mangle: true,
				compress: true,
				wrap: true
			},
			my_target: {
				files: {
					'dist/textAngular.min.js': ['src/textAngularSetup.js','src/textAngular.js'],
					'dist/textAngular-sanitize.min.js': ['src/textAngular-sanitize.js']
				}
			}
		},
		// Watches files for changes and runs tasks based on the changed files
		watch: {
			bower: {
				files: ['bower.json'],
				tasks: ['bowerInstall']
			},
			js: {
				files: ['src/{,*/}*.js'],
				tasks: ['newer:jshint:all'],
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
			},
			jsTest: {
				files: ['test/{,*/}*.js'],
				tasks: ['newer:jshint:test', 'karma']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'src/{,*/}*.html',
					'.tmp/styles/{,*/}*.css'
				]
			}
		},
		// Automatically inject Bower components into the app
		bowerInstall: {
			app: {
				src: ['src/index.html'],
				ignorePath: new RegExp('^src/')
			}
		},
		connect: {
			options: {
				port: 9000,
				hostname: '0.0.0.0',
				livereload: 35729
			},
			livereload: {
				options: {
					open: 'http://localhost:9000',
					base: [
						'.tmp',
						'src'
					]
				}
			},
			test: {
				options: {
					port: 9001,
					base: [
						'.tmp',
						'test',
						'src'
					]
				}
			},
			dist: {
				options: {
					base: 'dist'
				}
			}
		},
		useminPrepare: {
			html: 'src/index.html',
			options: {
				dest: 'dist',
				flow: {
					html: {
						steps: {
							js: ['concat', 'uglifyjs'],
							css: ['cssmin']
						},
						post: {
						}
					}
				}
			}
		},
		// Performs rewrites based on filerev and the useminPrepare configuration
		usemin: {
			html: ['dist/{,*/}*.html'],
			css: ['dist/styles/{,*/}*.css'],
			options: {
				assetsDirs: ['dist', 'dist/images']
			}
		},
		// ngmin tries to make the code safe for minification automatically by
		// using the Angular long form for dependency injection. It doesn't work on
		// things like resolve or inject so those have to be done manually.
		ngmin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp/concat/scripts',
						src: '*.js',
						dest: '.tmp/concat/scripts'
					}
				]
			}
		},
		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [
					{
						expand: true,
						dot: true,
						cwd: 'src',
						dest: 'dist',
						src: [
							'*.{ico,png,txt}',
							'.htaccess',
							'*.html',
							'{,*/}*.html'
						]
					}
				]
			},
			styles: {
				expand: true,
				cwd: 'src/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		}

	});


	grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			'bowerInstall',
			'connect:livereload',
			'watch'
		]);
	});
};