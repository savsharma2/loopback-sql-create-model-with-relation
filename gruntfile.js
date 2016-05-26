module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    initialfiles: {
      files: ['server/boot/1-script.js']
    }
  });

  grunt.registerTask('initialize-loop-back', 'A sample task that logs stuff.',
    function() {
      var files = (grunt.config('initialfiles.files')),
        fileToRun;
      grunt.config.requires('initialfiles');
      grunt.log.writeln(files instanceof Array);
      files.forEach(function(file) {
        fileToRun = require('server/boot/1-script.js');
      })
      grunt.log.writeln('The meta.name property is: ' + grunt.config('initialfiles.files'));
    });

  // grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['initialize-loop-back']);

};
