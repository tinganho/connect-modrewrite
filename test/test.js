
/**
 * Module dependencies.
 */
var modRewrite = require('../')
  , sinon = require('sinon')
  , chai = require('chai')
  , expect = require('chai').expect;

/**
 * Plugins.
 */

var sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);

/**
 * Specs.
 */

describe('Connect-modrewrite', function() {
  describe('last flag', function() {
    it('should not go to next rewrite rule', function() {
      var middleware = modRewrite(['/a /b [L]', '/a /c']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/a'
      };
      var res = {
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = sinon.spy();
      middleware(req, res, next);
      expect(req.url).to.equal('/b');
    });
  });
});
