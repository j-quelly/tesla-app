module.exports = (grunt) ->
	grunt.initConfig
		pkg: grunt.file.readJSON("package.json") 
		path: require "path"
		# cache busting
		cb: "1.0.0"

		# list our available tasks
		availabletasks:
			tasks:
				options:
					filter: "include", 
					tasks: [ 
						"serve-dev"
					]
					descriptions:
						"serve-dev": "Boots up server and opens default browser"


		# runs tasks concurrently				
		concurrent:
			dev: [
				"nodemon:dev",
				"watch"
			]
			options:
				logConcurrentOutput: true


		# boots up nodemon
		nodemon:
			dev:
				scripts: "bin<%= path.sep %>www"
				options:
					env: { 
						"NODE_ENV": "dev" 
					}				
					delay: 300
					callback: (nodemon) ->

						nodemon.on "log", (event) ->
							console.log event.colour
                        
						nodemon.on "config:update", ->
							setTimeout ->
								require("open") "http://localhost:3000"
							, 1000

						nodemon.on "restart", -> 
							setTimeout ->
								require("fs").writeFileSync(".rebooted", "rebooted")
							, 1000


		# compile sass to css
		sass:
			dev:
				options:  
					compress: false 
				files: [
					"src<%= path.sep %>client<%= path.sep %>css<%= path.sep %>app.css" : "src<%= path.sep %>client<%= path.sep %>sass<%= path.sep %>styles.scss",
				]
			build:
				options:
					compress: false
				files: [
					"dist<%= path.sep %>css<%= path.sep %>app.css" : "src<%= path.sep %>client<%= path.sep %>sass<%= path.sep %>styles.scss",
				]							


		# watches files and runs tasks when the files change
		watch:
			options:
				livereload: true

			sassfiles:
				files: [
					"src<%= path.sep %>client<%= path.sep %>sass<%= path.sep %>**<%= path.sep %>*.scss"
				]
				tasks: ['sass:dev']
				options:
					spawn: false

			jadefiles:
				files: [
					"src<%= path.sep %>client<%= path.sep %>views<%= path.sep %>**<%= path.sep %>*.jade"
				]
				options:
					spawn: false					

			jsfiles:
				files: [
					"src<%= path.sep %>client<%= path.sep %>js<%= path.sep %>*.js"
				]					
				options: 
					spawn: false	


		# compile jade to html
		jade:
			compile:
				options:
					data:
						debug: false
					pretty: true
				files:
					"dist<%= path.sep %>index.html" : ["src<%= path.sep %>client<%= path.sep %>views<%= path.sep %>index.jade"]


		# remove unused css
		uncss:
			build:
				files: { 
					'dist<%= path.sep %>css<%= path.sep %>app.css' : ['dist<%= path.sep %>index.html']
				}


		# minify js
		uglify:
			build:
				options:
					beautify: false
				files: {	
					"dist<%= path.sep %>js<%= path.sep %>app-<%= cb %>.min.js" : ['src<%= path.sep %>client<%= path.sep %>js<%= path.sep %>app.js'],
				}


		# compress our css files		
		cssmin:
			build:
				files: {
					'dist<%= path.sep %>css<%= path.sep %>app-<%= cb %>.min.css': ['dist<%= path.sep %>css<%= path.sep %>app.css']	
				}


		# replace dev dep with build dependencies
		'string-replace':	
			build:
				files:
					'dist<%= path.sep %>index.html' : 'dist<%= path.sep %>index.html'
				options:
					replacements: [
						{
							pattern: '<link rel="stylesheet" href="/css/app.css">'
							replacement: '<link rel="stylesheet" href="css/app-<%= cb %>.min.css">' 
						},
						{
							pattern: '<script src="//localhost:35729/livereload.js">  </script>' 
							replacement: '' 
						},
						{
							pattern: '<script src="js/app.js"></script>' 
							replacement: '<script src="js/app-<%= cb %>.min.js"></script>' 
						}											
					]	


		# automagically prefix our css
		postcss:
			options:
				map: false,
				processors: [
					require('pixrem')(), # add fallbacks for rem units
        			require('autoprefixer')({browsers: ['last 2 versions']}), # add vendor prefixes
        		]
			dev:
				src: ['src<%= path.sep %>client<%= path.sep %>css<%= path.sep %>*.css'] 
			build:
				src: ['dist<%= path.sep %>css<%= path.sep %>app.css'] 
			# vet:
			# 	src: ['.tmp<%= path.sep %>css<%= path.sep %>**<%= path.sep %>*.css'] 


		# copies image files
		copy:
			# options: {
			# 	processContentExclude: ['**<%= path.sep %>*.{png,gif,jpg,ico}']
			# }
			images:
				files: [{
					expand: true
					cwd: 'src<%= path.sep %>client<%= path.sep %>images<%= path.sep %>'
					src: ['**<%= path.sep %>*.{svg,png,jpg}'] 
					dest: 'dist<%= path.sep %>images<%= path.sep %>'   
				}] 


		imagemin: 
			build:
				options:
					cache: true
					optimizationLevel: 3
				files: [{
					expand: true
					cwd: 'src<%= path.sep %>client<%= path.sep %>images<%= path.sep %>'
					src: ['**<%= path.sep %>*.{png,jpg,gif,ico,pxm}'] 
					dest: 'dist<%= path.sep %>images<%= path.sep %>'
				}] 				


		# lint our css files 
		# csslint:
		# 	tmp:
		# 		options:
		# 			import: 2
		# 			csslintrc: '.csslintrc'
		# 		src: [
		# 			'.tmp<%= path.sep %>css<%= path.sep %>**<%= path.sep %>*.css'
		# 			'!.tmp<%= path.sep %>css<%= path.sep %>bootstrap.css'
		# 		]			

		# cleans folders for us
		clean:
			build:
				src: [
					'dist<%= path.sep %>*.html'
					'dist<%= path.sep %>css'
					'dist<%= path.sep %>js'
				]				


	# require our tasks
	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt); 
	grunt.loadNpmTasks "grunt-string-replace"


	# register our grunt tasks
	grunt.registerTask("default", ["availabletasks"])
	grunt.registerTask("serve-dev", ["sass:dev", "postcss:dev", "concurrent:dev"])
	grunt.registerTask("build", [
		"clean:build", 
		"jade:compile", 
		"sass:build", 
		"postcss:build", 
		"uncss:build", 
		"cssmin:build", 
		"uglify:build", 
		"string-replace:build", 
		"imagemin:build"
	])
	# grunt.registerTask("vetcss", ["clean:tmp", "less:vet", "postcss:vet", "csslint:tmp"])