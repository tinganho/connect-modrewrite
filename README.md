connect-modrewrite [![Build Status](https://travis-ci.org/tinganho/connect-modrewrite.png)](https://travis-ci.org/tinganho/connect-modrewrite)
========================
`connect-modrewrite` is a middleware for connect. It adds modrewrite functionality to your project.

# Getting started
Install `connect-modrewrite` with:
```bash
npm install connect-modrewrite
```

Require it in your Gruntfile.js file:

```javascript
var modRewrite = require('connect-modrewrite');
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
In the example above, `modRewrite` take as an `Array` of rewrite rules as an argument.
Each rewrite rule is a string with the syntax:
`MATCHING_PATHS REPLACE_WITH [FLAGS]`.
`MATCHING_PATHS` should be defined using a regex string. And that string is passed as an argument to the javascript `RegExp Object` for matching of paths. `REPLACE_WITH` is the replacement string for matching paths. Flags is optional and is defined using hard brackets. We currently only support the last flag `[L]`. Please give suggestions to more flags that makes sense for `connect-modrewrite`. Keep in mind that `grunt-contrib-connect` is meant to be a simple static server.

## Inverted URL matching
Begin with `!` for inverted URL matching.

## Flags
### Last [L]
If a path matches, any subsequent rewrite rules will be disregarded.

## Authors
Tingan Ho, tingan87[at]gmail.com

## License
Copyright (c) 2012 Tingan Ho
Licensed under the MIT license.
