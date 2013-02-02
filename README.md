grunt-contrib-connect-modrewrite
========================
`grunt-contrib-connect-modrewrite` is a middleware for grunt-contrib-connect. It adds modrewrite functionality to your grunt project.


# Basic usage
In your Gruntfile.js file:

```javascript
var modRewrite = require('grunt-contrib-connect-modrewrite');
```
In grunt.initConfig please add the following code snippet:

```javascript
connect: {
  server: {
    options: {
      port: 9001,
      base: 'example',
      keepalive: true,
      middleware: function(connect, options) {
        return [
          modRewrite([
            '^/friends$ /index.html',
            '^/friends/(.*)$ /index.html [L]'
          ]),
          connect.static(options.base)
        ]
      }
    }
  }
}
```

# Configurations
In the example above, `modRewrite` take as an `Array` of rules as en arugment.

