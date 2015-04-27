
/**
 * Module dependencies
 */

var url = require('url');
var qs = require('qs');
var httpReq = require('http').request;
var httpsReq = require('https').request;
var defaultVia = '1.1 ' + require('os').hostname();

/**
 * Syntaxes
 */

var noCaseSyntax = /NC/;
var lastSyntax = /L/;
var proxySyntax = /P/;
var redirectSyntax = /R=?(\d+)?/;
var forbiddenSyntax = /F/;
var goneSyntax = /G/;
var typeSyntax = /T=([\w|\/]+,?)/;
var hostSyntax =  /H=([^,]+)/;
var flagSyntax = /\[(.*)\]$/;
var partsSyntax = /\s+|\t+/g;
var httpsSyntax = /^https/;
var querySyntax = /\?(.*)/;

/**
 * Export `API`
 */

module.exports = function(rules) {
  // Parse the rules to get flags, replace and match pattern
  rules = _parse(rules);

  return function(req, res, next) {
    var protocol = req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    var callNext = true;

    rules.some(function(rule) {

      if(rule.host) {
        if(!rule.host.test(req.headers.host)) {
          return false;
        }
      }

      var location;
      if(/\:\/\//.test(rule.replace)) {
        location = req.url.replace(rule.regexp, rule.replace);
      }
      else {
        location = protocol + '://' + req.headers.host + req.url.replace(rule.regexp, rule.replace);
      }

      var match = rule.regexp.test(req.url);

      // If not match
      if(!match) {
        // Inverted rewrite
        if(rule.inverted) {
          req.url = rule.replace;
          return rule.last;
        }

        return false;
      }

      // Type
      if(rule.type) {
        res.setHeader('Content-Type', rule.type);
      }

      // Gone
      if(rule.gone) {
        res.writeHead(410);
        res.end();
        callNext = false;
        return true;
      }

      // Forbidden
      if(rule.forbidden) {
        res.writeHead(403);
        res.end();
        callNext = false;
        return true;
      }

      // Proxy
      if(rule.proxy) {
        _proxy(rule, {
          protocol : protocol,
          req : req,
          res : res,
          next : next
        });
        callNext = false;
        return true;
      }

      // Redirect
      if(rule.redirect) {
        res.writeHead(rule.redirect, {
          Location : location
        });
        res.end();
        callNext = false;
        return true;
      }

      // Rewrite
      if(!rule.inverted) {
        if (rule.replace !== '-') {
          req.url = req.url.replace(rule.regexp, rule.replace);
        }
        return rule.last;
      }
    });

    // Add to query object
    var queryValue = querySyntax.exec(req.url);
    if(queryValue) {
      req.params = req.query = qs.parse(queryValue[1]);
    }

    if(callNext) {
      next();
    }

  };
};

/**
 * Get flags from rule rules
 *
 * @param {Array.<rules>} rules
 * @return {Object}
 * @api private
 */

function _parse(rules) {
  return (rules || []).map(function(rule) {
    // Reset all regular expression indexes
    lastSyntax.lastIndex = 0;
    proxySyntax.lastIndex = 0;
    redirectSyntax.lastIndex = 0;
    forbiddenSyntax.lastIndex = 0;
    goneSyntax.lastIndex = 0;
    typeSyntax.lastIndex = 0;
    hostSyntax.lastIndex = 0;

    var parts = rule.replace(partsSyntax, ' ').split(' '), flags = '';

    if(flagSyntax.test(rule)) {
      flags = flagSyntax.exec(rule)[1];
    }

    // Check inverted urls
    var inverted = parts[0].substr(0, 1) === '!';
    if(inverted) {
      parts[0] = parts[0].substr(1);
    }

    var redirectValue = redirectSyntax.exec(flags);
    var typeValue = typeSyntax.exec(flags);
    var hostValue = hostSyntax.exec(flags);

    return {
      regexp: typeof parts[2] !== 'undefined' && noCaseSyntax.test(flags) ? new RegExp(parts[0], 'i') : new RegExp(parts[0]),
      replace: parts[1],
      inverted: inverted,
      last: lastSyntax.test(flags),
      proxy: proxySyntax.test(flags),
      redirect: redirectValue ? (typeof redirectValue[1] !== 'undefined' ? redirectValue[1] : 301) : false,
      forbidden: forbiddenSyntax.test(flags),
      gone: goneSyntax.test(flags),
      type: typeValue ? (typeof typeValue[1] !== 'undefined' ? typeValue[1] : 'text/plain') : false,
      host: hostValue ? new RegExp(hostValue[1]) : false
    };
  });
}

/**
 * Proxy the request
 *
 * @param {Object} rule
 * @param {Object} metas
 * @return {void}
 * @api private
 */

function _proxy(rule, metas) {
  var opts = _getRequestOpts(metas.req, rule);
  var request = httpsSyntax.test(rule.replace) ? httpsReq : httpReq;

  var pipe = request(opts, function (res) {
    res.headers.via = opts.headers.via;
    metas.res.writeHead(res.statusCode, res.headers);
    res.on('error', function (err) {
      metas.next(err);
    });
    res.pipe(metas.res);
  });

  pipe.on('error', function (err) {
    metas.next(err);
  });

  if(!metas.req.readable) {
    pipe.end();
  } else {
    metas.req.pipe(pipe);
  }
}

/**
 * Get request options
 *
 * @param {HTTPRequest} req
 * @param {Object} rule
 * @return {Object}
 * @api private
 */

function _getRequestOpts(req, rule) {
  var opts = url.parse(req.url.replace(rule.regexp, rule.replace), true);
  var query = (opts.search != null) ? opts.search : '';

  if(query) {
    opts.path = opts.pathname + query;
  }
  opts.method  = req.method;
  opts.headers = req.headers;
  var via = defaultVia;
  if(req.headers.via) {
    via = req.headers.via + ', ' + via;
  }
  opts.headers.via = via;

  delete opts.headers['host'];

  return opts;
}
