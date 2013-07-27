

var url    = require('url')
  , extend = require('extend');

module.exports = function(rules) {

  'use strict';

  rules = (rules || []).map(function(rule) {

    var parts = rule.replace(/\s+|\t+/g, ' ').split(' ');

    // Check inverted urls
    var inverted = parts[0].substr(0,1) === '!';
    if(inverted) {
      parts[0] = parts[0].substr(1);
    }

    return {
      regex    : new RegExp(parts[0]),
      replace  : parts[1],
      inverted : inverted,
      last     : typeof parts[2] !== 'undefined' ? /L/g.test(parts[2]) : false,
      proxy    : typeof parts[2] !== 'undefined' ? /P/.test(parts[2]) : false
    };

  });

  return function(req, res, next) {

    var protocol = req.connection.encrypted ? 'https' : 'http'
    var request = require(protocol).request;

    rules.some(function(rewrite) {
      var location = protocol + '://' + req.headers.host + rewrite.replace;
      // Rewrite Url
      if(rewrite.proxy) {
        var opts = url.parse(rewrite.replace);
        // options request
        opts.method      = req.method;
        opts.headers     = req.headers;
        var via = '1.1 ' + require('os').hostname();
        if(req.headers.via) {
           via = req.headers.via + ', ' + via;
        }
        opts.headers.via = via;

        // Forwarding the host breaks dotcloud
        delete opts.headers['host'];

        var _req = request(opts, function (_res) {
          _res.headers.via = via;
          resp.writeHead(_res.statusCode, _res.headers);
          _res.on('error', function (err) {
            next(err);
          });
          _res.pipe(resp);
        });
        _res.on('error', function (err) {
          next(err);
        });
        if (!req.readable) {
          _res.end();
        } else {
          req.pipe(_res);
        }
        return true;
      } else if(!rewrite.regex.test(req.url) && rewrite.inverted) {
        res.setHeader('Location', location);
        req.url = rewrite.replace;
        return rewrite.last;
      } else if(rewrite.regex.test(req.url)  && !rewrite.inverted) {
        res.setHeader('Location', location);
        req.url = req.url.replace(rewrite.regex, rewrite.replace);
        return rewrite.last;
      }

    });

    next();

  };
}
