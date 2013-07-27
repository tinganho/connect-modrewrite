

var url = require('url');

module.exports = function(rules) {

  'use strict';

  rules = (rules || []).map(function(rule) {

    var parts = rule.replace(/\s+|\t+/g, ' ').split(' ');
    var flags = '';
    if(/\[(.*)\]/.test(rule)) {
      flags = /\[(.*)\]/.exec(rule)[1];
    }

    // Check inverted urls
    var inverted = parts[0].substr(0,1) === '!';
    if(inverted) {
      parts[0] = parts[0].substr(1);
    }

    return {
      regex          : typeof parts[2] !== 'undefined' && /NC/.test(flags) ? new RegExp(parts[0], 'i') : new RegExp(parts[0]),
      replace        : parts[1],
      inverted       : inverted,
      last           : typeof parts[2] !== 'undefined' ? /L/.test(flags) : false,
      proxy          : typeof parts[2] !== 'undefined' ? /P/.test(flags) : false,
      redirect       : typeof parts[2] !== 'undefined' ? /R/.test(flags) : false
    };

  });

  return function(req, res, next) {

    var protocol = req.connection.encrypted ? 'https' : 'http'
      , request  = require(protocol).request
      , _next    = true;

    rules.some(function(rewrite) {
      var location = protocol + '://' + req.headers.host + rewrite.replace;
      // Rewrite Url
      if(rewrite.regex.test(req.url) && rewrite.proxy) {
        var opts     = url.parse(rewrite.replace);
        opts.path    = opts.pathname + '/';
        opts.method  = req.method;
        opts.headers = req.headers;
        var via = '1.1 ' + require('os').hostname();
        if(req.headers.via) {
           via = req.headers.via + ', ' + via;
        }
        opts.headers.via = via;

        delete opts.headers['host'];

        var _req = request(opts, function (_res) {
          _res.headers.via = via;
          res.writeHead(_res.statusCode, _res.headers);
          _res.on('error', function (err) {
            next(err);
          });
          _res.pipe(res);
        });
        _req.on('error', function (err) {
          next(err);
        });
        if(!req.readable) {
          _req.end();
        } else {
          req.pipe(_req);
        }
        _next = false;
        return true;
      } else if(rewrite.regex.test(req.url) && rewrite.redirect) {
        if(res.redirect) {
          res.redirect(rewrite.replace);
        } else {
          if(/\w+:\/\//.test(rewrite.replace)) {
            location = rewrite.replace;
          }
          res.writeHead(301, {
            Location : rewrite.replace
          });
          res.end();
        }
        _next = false;
        return true;
      } else if(!rewrite.regex.test(req.url) && rewrite.inverted) {
        res.setHeader('Location', location);
        req.url = rewrite.replace;
        return rewrite.last;
      } else if(rewrite.regex.test(req.url) && !rewrite.inverted) {
        res.setHeader('Location', location);
        req.url = req.url.replace(rewrite.regex, rewrite.replace);
        return rewrite.last;
      }

    });
    if(_next) {
      next();
    }

  };
}
