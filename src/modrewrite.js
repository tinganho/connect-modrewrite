module.exports = function(rules, normalize) {

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
      last     : typeof parts[2] !== 'undefined' ? /L/g.test(parts[2]) : false
    };

  });

  function isNormalizable(url) {
    var normalizable = false;
    if(normalize) {
      for(var i in normalize) {
        if(normalize[i].test(url) && !normalizable){
          normalizable = true;
          break;
        }
      }
    }
    return normalizable;
  }

  function normalizeUrl(req) {
    // Split URLs for later normalization
    var referersSplits = req.headers.referer..split('?')[0].split('/'),
        urlSplits = req.url.substr(1).split('/'); // substr(1) is there because the string begins with /
    // Remove hostname
    referersSplits.splice(0, 3);
    // Remove the last part of the referer since it is not
    // supposed to be used in the normalization process
    referersSplits.pop();
    // Normalization process
    urlSplits.splice(0, referersSplits.length);
    // Join back all splits
    req.url = '/' + urlSplits.join('/');
  }

  return function(req, res, next) {

    // Some request are not assets request, which means they don't
    // have an HTTP referer. We only normalize path which are assets
    if(typeof req.headers.referer !== 'undefined') {
      if(normalize) {
        if(isNormalizable(req.url)) {
          normalizeUrl(req);
        }
      }
    }

    var protocol = req.connection.encrypted ? 'https' : 'http'

    rules.some(function(rewrite) {
        var location = protocol + '://' + req.headers.host + rewrite.replace;
        // Rewrite Url
        if(rewrite.regex.test(req.url) && rewrite.inverted) {
          return rewrite.last;
        } else if(!rewrite.regex.test(req.url) && rewrite.inverted) {
          res.setHeader('Location', location);
          req.url = rewrite.replace;
          return req.url.replace(rewrite.regex, rewrite.replace);
        } else if(rewrite.regex.test(req.url)) {
          res.setHeader('Location', location);
          req.url = req.url.replace(rewrite.regex, rewrite.replace);
          return rewrite.last;
        }
    });

    next();

  };
}
