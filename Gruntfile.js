
var jshintGlobals = require('jshint-globals');

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({

    jshint: {
      options: {
        es5 : false,
        strict : false,
        curly : false,
        eqeqeq : true,
        loopfunc : true,
        forin : false,
        immed : true,
        latedef : true,
        newcap : true,
        noarg : true,
        sub : true,
        undef : true,
        boss : true,
        eqnull : true,
        node : true,
        supernew : true,
        laxbreak : true,
        expr : true,
        laxcomma : true,
        unused : true,
        latedef : false,
        globals: jshintGlobals({
          mocha : jshintGlobals.mocha
        })
      },

      files: [
        'index.js',
        'test/**/*.js'
      ]
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
};
