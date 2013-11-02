

var url         = require('url')
  , querystring = require('querystring');

module.exports = function(rules) {

  'use strict';

  rules = (rules || []).map(function(rule) {

    var parts = rule.replace(/\s+|\t+/g, ' ').split(' ');
    var flags = '', flagRegex = /\[(.*)\]$/;
    if(flagRegex.test(rule)) {
      flags = flagRegex.exec(rule)[1];
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
      last           : /L/.test(flags),
      proxy          : /P/.test(flags),
      redirect       : /R=?(\d+)?/.test(flags) ? (typeof /R=?(\d+)?/.exec(flags)[1] !== 'undefined' ? /R=?(\d+)?/.exec(flags)[1] : 301) : false,
      forbidden      : /F/.test(flags),
      gone           : /G/.test(flags),
      type           : /T=([\w|\/]+)/.test(flags) ? (typeof /T=([\w|\/]+)/.exec(flags)[1] !== 'undefined' ? /T=([\w|\/]+)/.exec(flags)[1] : 'text/plain') : false,
    };

  });

  return function(req, res, next) {
    var protocol = req.connection.encrypted ? 'https' : 'http'
      , request  = require(protocol).request
      , _next    = true;

    rules.some(function(rewrite) {
      var location = protocol + '://' + req.headers.host + req.url.replace(rewrite.regex, rewrite.replace);
      // Rewrite Url
      if(rewrite.regex.test(req.url) && rewrite.type) {
        res.setHeader('Content-Type', rewrite.type);
      }
      if(rewrite.regex.test(req.url) && rewrite.gone) {
        res.writeHead(410);
        res.end();
        _next = false;
        return true;
      } else if(rewrite.regex.test(req.url) && rewrite.forbidden) {
        res.writeHead(403);
        res.end();
        _next = false;
        return true;
      } else if(rewrite.regex.test(req.url) && rewrite.proxy) {
        var opts     = url.parse(req.url.replace(rewrite.regex, rewrite.replace));
        var query    = (opts.search != null) ? opts.search : '';
        if(query === '') {
          opts.path = opts.pathname;
        }
        else {
          opts.path = opts.pathname + '/' + query;
        }
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
        res.writeHead(rewrite.redirect, {
          Location : location
        });
        res.end();
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

    // Add to query object
    if(/\?.*/.test(req.url)) {
      req.params = req.query = querystring.parse(/\?(.*)/.exec(req.url)[1]);
    }

    if(_next) {
      next();
    }

  };
}
