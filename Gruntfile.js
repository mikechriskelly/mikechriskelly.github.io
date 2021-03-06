module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Shell commands to send to jekyll
    shell: {
      build: {
        options: {
          stdout: true,
          stderr: true
        },
        command: 'jekyll build'
      },
      serve: {
        command: 'jekyll serve --config _config.yml,_config-dev.yml'
      },
      deploy: {
        command: 'bundle exec rake blog:publish'
      }
    },
    // Compass compilation task.
    compass: {
      dist: {
        options: {
          config: 'config.rb',
          bundleExec: true, // Execute our compass command with bundle exec.
        }
      }
    },
    // Compile YAML data into JSON (HTML templates use YAML, JS scripts use JSON)
    yaml: {
      locationdata: {
        options: {
          ignored: /^_/,
          space: 4,
          customTypes: {
            '!include scalar': function(value, yamlLoader) {
              return yamlLoader(value);
            },
            '!max sequence': function(values) {
              return Math.max.apply(null, values);
            },
            '!extend mapping': function(value, yamlLoader) {
              return _.extend(yamlLoader(value.basePath), value.partial);
            }
          }
        },
        files: [
          // Use YAML file from _data directory to make a JSON file in locations directory   
          {expand: true, cwd: '_data/', src: ['locations.yml'], dest: 'locations/'}
        ]
      },
    },
    // Compile and compress source javascript files
    uglify: {
      javascripts: {
        options: {
          sourceMap: true,
          sourceMapName: 'js/sourcemap.map'
        },
        files: {
          // Compile scripts used across the site 
          'js/main.min.js': ['_javascripts/locator.js', '_javascripts/bootstrap.min.js', '_javascripts/hovernav.js', '_javascripts/responsive-tabs.js', '_javascripts/kalendar.js'],
          // Special script just for the embedded Google map
          'js/locationsmap.min.js': ['_javascripts/locationsmap.js','_javascripts/store-locator.js']
        }
      }
    },
    cacheBust: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 16
      },
      assets: {
        files: [{
          src: [
            '_site/index.html',
            'about/*.html',
            'careers/*.html',
            'contact/*.html',
            'locations/**/*.html',
            'programs/**/*.html',
            'policy/*.html',
            'css/main.css'
           ]
        }]
      }
    },
    // Generate different sized images for responsive banner photos
    responsive_images: {
      banners: {
        options: {
          sizes: [{
            name: 'sm',
            width: 640,
            aspectRatio: false,
          },{
            name: 'md',
            width: 992,
          },{
            name: 'lg',
            width: 1440,
          },{
            name: 'md-x',
            width: 992,
            height: 300,
            aspectRatio: false,
          },{
            name: 'lg-x',
            width: 1440,
            height: 300,
            aspectRatio: false,
          }]
        },
        files: [{
          expand: true,
          src: ['*.{jpg,gif,png}'],
          cwd: '_assets/process-banners',
          dest: 'images/bannerphotos'
        }]
      },
      managers: {
        options: {
          sizes: [{
            width: 300,
            height: 450,
            aspectRatio: false,
            rename: false,
          }]
        },
        files: [{
          expand: true,
          src: ['*.{jpg,gif,png}'],
          cwd: '_assets/process-managers',
          dest: 'images/managers'
        }]
      },
    },
    // The default task we leave running to watch for file changes.
    watch: {
      css: {
        files: '_sass/*.scss',
        tasks: ['compass'],
        options: {
          atBegin: true,
          livereload: true
        }
      },
      js: {
        files: '_javascripts/**/*.js',
        tasks: ['uglify'],
        options: {
          atBegin: true,
          livereload: true
        }
      },
      data: {
        files: '_data/**/*.yml',
        tasks: ['yaml'],
        options: {
          atBegin: true,
          livereload: true
        }
      },
      jekyll: {
        files: [
          '_includes/*.html',
          '_layouts/*.html',
          '_data/*.yml',
          '_config.yml',
          'index.html',
          'about/*.html',
          'careers/*.html',
          'confirmation/**/*.html',
          'contact/*.html',
          'locations/*.html',
          'locations/**/*.html',
          'locations/*.json',
          'news/*.html',
          'news/_posts/*.md',
          'policy/*.html',
          'programs/**/*.html',
          'spotlight/*.html',
          'spotlight/_posts/*.md',
          'css/*.css',
          'js/*.js'
        ],
        tasks: ['shell:serve'],
        options: {
          atBegin: true,
          livereload: true
        }
      }
    },
    concurrent: {
      target: {
          tasks: ['shell:serve', 'watch'],
          options: {
              logConcurrentOutput: true
          }
      }
    }
  });
  // Load extension for running shell commands
  grunt.loadNpmTasks('grunt-shell');
  // Load the 'watch' task extension.
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Load extension for jekyll
  grunt.loadNpmTasks('grunt-jekyll');
  // Load extension to compile sass/compass.
  grunt.loadNpmTasks('grunt-contrib-compass');
  // Load extension to compile and minify javascript 
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load extension to convert YAML into JSON (used for location data)
  grunt.loadNpmTasks('grunt-yaml');
  // Register default task to watch for file changes.
  grunt.loadNpmTasks('grunt-concurrent');
  // Extention for generating images at different resolutions
  grunt.loadNpmTasks('grunt-responsive-images');
  // Extension for caching static assets
  grunt.loadNpmTasks('grunt-cache-bust')
  ;
  grunt.registerTask('default', ['concurrent:target']);
  //grunt.registerTask('default',['watch']);
  grunt.registerTask('serve',['default']);
  grunt.registerTask('build',['compass','uglify', 'yaml','shell:build','cacheBust']);
  grunt.registerTask('deploy',['build','shell:deploy']);
  grunt.registerTask('bannerpics',['responsive_images:banners']);
  grunt.registerTask('managerpics',['responsive_images:managers']);
};
