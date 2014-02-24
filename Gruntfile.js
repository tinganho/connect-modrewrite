module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({

    jshint: {
      options: {
        asi       : true,
        curly     : true,
        eqeqeq    : true,
        immed     : true,
        latedef   : true,
        newcap    : true,
        noarg     : true,
        sub       : true,
        undef     : true,
        boss      : true,
        eqnull    : true,
        browser   : true,
        camelcase : true,
        unused    : true,
        node      : true,
        laxcomma  : true
      },
      files: [
      ]
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
};
