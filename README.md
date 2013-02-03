grunt-contrib-connect-modrewrite
========================
`grunt-contrib-connect-modrewrite` is a middleware for grunt-contrib-connect. It adds modrewrite functionality to your grunt project.

# Getting started
Install `grunt-contrib-connect-modrewrite` with:
```bash
npm install grunt-contrib-connect-modrewrite
```

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
            '^/test$ /index.html',
            '^/test/\\d*$ /index.html [L]',
            '^/test/\\d*/\\d*$ /flag.html [L]'
          ]),
          connect.static(options.base)
        ]
      }
    }
  }
}
```

# Configurations
In the example above, `modRewrite` take as an `Array` of rewrite rules as an arugment.
Each rewrite rule is a string with the syntax:
`MATCHING_PATHS REPLACE_WITH [FLAGS]`
`MATCHING_PATHS` should be defined using a regex string. And that string is passed as an argument to the javascript `RegExp Object` for matching of paths. `REPLACE_WITH` is the replacement string for matching paths. Flags is defined using hard brackets. We currently only support the last flag `[L]`. Please give suggestions to more flags that makes sense for `grunt-contrib-connect-modrewrite`. Keep in mind that `grunt-contrib-connect` is meant to be a simple static server.

## Flags
### Last [L]
If a path matches, any subsequent rewrite rules will be disregarded.
