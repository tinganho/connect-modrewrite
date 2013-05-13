connect-modrewrite [![Build Status](https://travis-ci.org/tinganho/connect-modrewrite.png)](https://travis-ci.org/tinganho/connect-modrewrite)
========================
`connect-modrewrite` adds modrewrite functionality to connect/express server.

# Getting started
Install `connect-modrewrite` with:
```bash
npm install connect-modrewrite --save
```

Require it:

```javascript
var modRewrite = require('connect-modrewrite');
```
An example configuration:

```javascript
var app = connect() // express() for express server
// app.configure(function() { for express server
  .use(modRewrite([
      '^/test$ /index.html',
      '^/test/\\d*$ /index.html [L]',
      '^/test/\\d*/\\d*$ /flag.html [L]'
    ], [
      /\/test/ //Notice that it is not a string
  ]))
  .use(connect.static(options.base))
  .listen(3000)
// }) for express server
```

# Configurations
In the example above, `modRewrite` take as an `Array` of rewrite rules as an argument.
Each rewrite rule is a string with the syntax:
`MATCHING_PATHS REPLACE_WITH [FLAGS]`.
`MATCHING_PATHS` should be defined using a regex string. And that string is passed as an argument to the javascript `RegExp Object` for matching of paths. `REPLACE_WITH` is the replacement string for matching paths. Flags is optional and is defined using hard brackets. We currently only support the last flag `[L]`. Please give suggestions to more flags that makes sense for `connect-modrewrite`.

## NEW IN VERSION 0.3
Connect-modrewrite normalized all URL:s that where assets before. Now in version 0.3 you need pass it as the second argument. The second argument needs to be a JS RegExp object. If a match occur a normalize urls process will begin. Normalizing assets can be convenient e.g. if you are serving JS/CSS files under the URL, http://localhost/blog/2. The browser will request the asset with e.g. `http://localhost/blog/style.css` instead of `http://localhost/style.css`. If you pass in `/\/blog/` as the second argument in `modRewrite` above, it will normalize all assets urls that begins with `/blog`

## Inverted URL matching
Begin with `!` for inverted URL matching.

## Use defined params
Just wrap the defined param with `()` and access it with `$n`. This is defined in JS `.replace` in https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/String/replace

`^/blog/(.*) /$1`

## Flags
### Last [L]
If a path matches, any subsequent rewrite rules will be disregarded.

## Authors
Tingan Ho, tingan87[at]gmail.com

## License
Copyright (c) 2012 Tingan Ho
Licensed under the MIT license.
