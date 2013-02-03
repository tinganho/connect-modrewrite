module.exports = function(rules) {

  'use strict';

  rules = (rules || []).map(function(rule) {

    var parts = rule.replace(/\s+|\t+/g, ' ').split(' ');

    return {
      regex: new RegExp(parts[0]),
      replace: parts[1],
      last: !!parts[2]
    };

  });

  return function(req, res, next) {

    rules.some(function(rewrite) {

      // Some request are not assets request, which means they don't
      // have an HTTP referer. We only normalize path which are assets
      if(typeof req.headers.referer === 'undefined') {

        // Rewrite Url
        req.url = req.url.replace(rewrite.regex, rewrite.replace);
        return rewrite.last;

      // Else normalize path
      } else {

        // Split URLs for later normalization
        var referersSplits = req.headers.referer.split('/'),
            urlSplits = req.url.substr(1).split('/'); // substr(1) is there because the string begins with /
        // Remove hostname
        referersSplits.splice(0, 3);
        // Remove the last part of the referer since it is not
        // supposed to be used in the normalization process
        referersSplits.pop();
        // Normalization process
        urlSplits.forEach(function(value, index) {
          if(value === referersSplits[index]) {
            urlSplits.splice(index, 1);
          } else {
            return false;
          }
        });
        // Join back all splits
        req.url = '/' + urlSplits.join('/');

        // Rewrite Url
        req.url = req.url.replace(rewrite.regex, rewrite.replace);
        return rewrite.last;

      } // End of normalization

    });

    next();

  };
}
