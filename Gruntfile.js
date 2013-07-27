module.exports = function(grunt) {

  var urlRewrite = require('./src/modrewrite');

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
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: 'example',
          keepalive: true,
          middleware: function(connect, options) {
            return [
              urlRewrite([

                // Test basics
                '^/test$ /index.html',
                '^/test/\\d*$ /index.html [L]',

                // Test nocase
                '^/test/nocase$ /nocase.html [NC, L]',

                // Test forbidden
                '^/test/forbidden$ [F]',

                // Test gone
                '^/test/gone$ [G]',

                // Test type
                '^/test/type$ /image [T=image/png, L]',

                // Test Proxy
                '^/test/proxy$ http://nodejs.org [P]',

                // Test redirect flag
                '^/test/redirect$ http://nodejs.org [R]',
                '^/test/redirect-309$ http://nodejs.org [R=309]',

                // Test last flag
                '^/test-flag$ /connection [L]',
                '^/connection$ /index.html',

                // Test last flag
                '^/test-flag-2$ /connection-2',
                '^/connection-2$ /index.html',

                // Test defined params
                '^/test-defined-params/(.*)$ /$1 [L]',

                // Test inverted URL
                '!\\.js|\\.css$ /index.html'

              ]),
              connect.static(options.base)
            ]
          }
        }
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'connect']);

};
