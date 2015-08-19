module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    babel: {
        options: {
            sourceMap: true
        },
        all: {
            files: [{
                expand: true,
                cwd: 'src',
                src: ['**/*.js', '**/*.es6'],
                dest: 'dist/',
                ext: '.js'
            }]
        }
    },
    watch: {
      gruntfile: {
        'files': 'Gruntfile.js',
      },
      src: {
        files: ['src/**/*.js', 'src/**/*.es6'],
        tasks: ['default']
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');

  // Default task(s).
  grunt.registerTask('default', ['babel']);

};