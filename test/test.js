
/**
 * Module dependencies.
 */

var modRewrite = require('../')
  , sinon = require('sinon')
  , chai = require('chai')
  , expect = require('chai').expect
  , proxyquire = require('proxyquire')
  , sinonChai = require('sinon-chai');

/**
 * Plugins.
 */

chai.should();
chai.use(sinonChai);

/**
 * Specs.
 */


describe('Connect-modrewrite', function() {
  describe('query params', function() {
    it('should keep nested query parameters', function() {
      var middleware = modRewrite(['/a /b [L]', '/a /c']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/d?foo[0]=bar&foo[1]=baz&q'
      };
      var res = {
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.query).to.deep.equal({foo: ['bar','baz'], q: ''});
    });
  });

  describe('non-match', function() {
    it('should leave the url unrewritten if there is no match', function() {
      var middleware = modRewrite(['/a /b [L]', '/a /c']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/d'
      };
      var res = {
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal('/d');
    });

    it('should keep the query parameters', function() {
      var middleware = modRewrite(['/a /b [L]', '/a /c']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/d?foo=bar&q'
      };
      var res = {
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.query).to.deep.equal({foo: 'bar', q: ''});
    });
  });

  describe('last flag', function() {
    it('should not go to next rewrite rule if the current matches', function() {
      var middleware = modRewrite(['/a /b [L]', '/a /c']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/a'
      };
      var res = {
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal('/b');
    });

    it('should go to to the next rewrite rule if the current doesn\'t matches', function() {
      var middleware = modRewrite(['/a /b [L]', '/b /c']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/b'
      };
      var res = {
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal('/c');
    });
  });

  describe('invert', function() {
    it('should rewrite if the pattern doesn\'t match', function() {
      var middleware = modRewrite(['!/a /b [L]', '/b /c']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/b'
      };
      var res = {
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal('/b');
    });

    it('shouldn\'t rewrite if the pattern match', function() {
      var middleware = modRewrite(['!/a /b [L]', '/b /c']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/b'
      };
      var res = {
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.not.equal('/c');
    });
  });

  describe('type', function() {
    it('should set content-type header if type flag is set', function() {
      var middleware = modRewrite(['!/ /b [T=image/jpeg]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/b'
      };
      var res = {
        setHeader : sinon.spy(),
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      res.setHeader.should.have.been.calledWith('Content-Type', 'image/jpeg');
    });

    it('should not do anything the type flag is not set', function() {
      var middleware = modRewrite(['/a /b [L]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/a'
      };
      var res = {
        setHeader : sinon.spy(),
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      res.setHeader.should.not.have.been.called;
    });
  });

  describe('gone', function() {
    it('should set status code to 410', function() {
      var middleware = modRewrite(['/a [G]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/a'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      res.writeHead.should.have.been.calledWith(410);
      res.end.should.have.been.calledOnce;
      res.end.should.have.been.calledAfter(res.writeHead);
    });

    it('should not do anything if gone flag is not set', function() {
      var middleware = modRewrite(['/a [G]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/d'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      res.writeHead.should.not.have.been.called;
      res.end.should.not.have.been.called;
    });
  });

  describe('forbidden', function() {
    it('should set status code to 403', function() {
      var middleware = modRewrite(['/a [F]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/a'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      res.writeHead.should.have.been.calledWith(403);
      res.end.should.have.been.calledOnce;
      res.end.should.have.been.calledAfter(res.writeHead);
    });

    it('should not do anything if gone flag is not set', function() {
      var middleware = modRewrite(['/a [F]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/d'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      res.writeHead.should.not.have.been.called;
      res.end.should.not.have.been.called;
    });
  });

  describe('redirect', function() {
    it('should set default status code to 301 if rewrite flag is set', function() {
      var middleware = modRewrite(['/a /b [R]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/a'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      res.writeHead.should.have.been.calledWith(301, { Location : 'http://test.com/b'});
      res.end.should.have.been.calledOnce;
      res.end.should.have.been.calledAfter(res.writeHead);
    });

    it('should be able to set a rewrite with hostname and protocol', function() {
      var middleware = modRewrite(['/(.*) http://localhost/$1 [R]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'localhost' },
        url : '/a'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      res.writeHead.should.have.been.calledWith(301, { Location : 'http://localhost/a'});
      res.end.should.have.been.calledOnce;
      res.end.should.have.been.calledAfter(res.writeHead);
    });

    it('should set custom status code if rewrite custom flag is set', function() {
      var middleware = modRewrite(['/a /b [R=307]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/a'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      res.writeHead.should.have.been.calledWith('307', { Location : 'http://test.com/b'});
      res.end.should.have.been.calledOnce;
      res.end.should.have.been.calledAfter(res.writeHead);
    });

    it('should not do anything if rewrite flag is not set', function() {
      var middleware = modRewrite(['/a /b [R=307]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/d'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      res.writeHead.should.not.have.been.called;
      res.end.should.not.have.been.called;
    });
  });

  describe('proxy', function() {
    it('should proxy request whenever proxy flag is set', function() {
      var httpReq = { on : sinon.spy(), end : sinon.spy(), headers : {} };
      var requestStub = sinon.stub().returns(httpReq);
      var modRewrite = proxyquire('../', { http : { request : requestStub }});
      var middleware = modRewrite(['/a http://test1.com/ [P]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test2.com' },
        url : '/a',
        pipe : function() {}
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      expect(requestStub.args[0][0].host).to.eql('test1.com');
      expect(requestStub.args[0][0].hostname).to.eql('test1.com');
      expect(requestStub.args[0][0].href).to.eql('http://test1.com/');
      expect(requestStub.args[0][0].headers.via).to.have.string('1.1');
      httpReq.end.should.have.been.calledOnce;
    });
  });

  describe('hostname', function() {
    it('should use the current rule if the host match', function() {
      var middleware = modRewrite(['/a /b [H=(.+)\\.webview\\..*]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'ios.webview.test.com' },
        url : '/a'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal('/b');
    });

    it('should be able to parse with other flags', function() {
      var middleware = modRewrite(['/a /b [H=(.+)\\.webview\\..*, L]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'ios.webview.test.com' },
        url : '/a'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal('/b');
    });

    it('should not jump to the next rule if the host doesn\'t match', function() {
      var middleware = modRewrite(['/a /b [H=(.+)\\.webview\\..*]']);
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : '/a'
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal('/a');
    });
  });

  describe('leave untouched', function() {
    it('should use the current rule if the host match', function() {
      var middleware = modRewrite(['^/a - [L]']);
      var url = '/a/foo/bar/woot';
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : url
      };
      var res = {
        writeHead : function() {},
        end : function() {}
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal(url);
    });
  });

  describe('only flags matched', function() {
    it('should only match rules in the final square brackets', function() {
      var middleware = modRewrite(['^/[a] /G [L]']);
      var url = '/a';
      var req = {
        connection : { encrypted : false },
        header : function() {},
        headers : { host : 'test.com' },
        url : url
      };
      var res = {
        setHeader : function() {},
        writeHead : sinon.spy(),
        end : sinon.spy()
      };
      var next = function() {};
      middleware(req, res, next);
      expect(req.url).to.equal('/G');
      res.writeHead.should.have.not.been.calledWith(410);
    });
  });
});
