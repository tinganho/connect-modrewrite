module.exports = function(grunt) {

  var urlRewrite = require('./src/main');

  // Project configuration.
  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 9001,
          base: 'example',
          keepalive: true,
          middleware: function(connect, options) {
            return [
              urlRewrite([
                '^/friends$ /index.html',
                '^/friends/(.*)$ /index.html [L]'
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

  // Default task(s).
  grunt.registerTask('default', ['connect']);

};
