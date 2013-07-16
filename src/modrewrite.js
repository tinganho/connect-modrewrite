
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
      last     : typeof parts[2] !== 'undefined' ? /L/g.test(parts[2]) : false
    };

  });

  return function(req, res, next) {

    var protocol = req.connection.encrypted ? 'https' : 'http'

    rules.some(function(rewrite) {
      var location = protocol + '://' + req.headers.host + rewrite.replace;
      // Rewrite Url
      if(!rewrite.regex.test(req.url) && rewrite.inverted) {
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
