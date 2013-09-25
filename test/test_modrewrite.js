var chai   = require('chai'),
    expect = chai.expect,
    http   = require('http'),
    exec   = require('child_process').exec;

describe('connect-modrewrite', function() {
  this.timeout(20000);
  it('should response to one level path', function(done) {
    http.get('http://localhost:9001/test', function(res){
      res.setEncoding('utf8');
      res.on('data', function(chunk){
        expect(chunk).to.be.a('string');
        done();
      });
    });
  });


  it('should be able to recognize Last [L] flag', function(done) {
    var doneRequest = 0;
    http.get('http://localhost:9001/test-flag', function(res) {
      expect(res.statusCode).to.equal(404);
      doneRequest++;
      if(doneRequest === 2) {
        done();
      }
    });
    http.get('http://localhost:9001/test-flag-2', function(res) {
      expect(res.statusCode).to.equal(200);
      doneRequest++;
      if(doneRequest === 2) {
        done();
      }
    });
  });

  it('should be able to handle defined params', function() {
    http.get('http://localhost:9001/test-defined-params/style.css', function(res) {
      expect(res.statusCode).to.equal(200);
    });
  });

  it('should be able to handle inverted urls 1', function(done) {
    var doneRequest = 0;
    var threshold = 2;
    http.get('http://localhost:9001/style.css', function(res) {
      expect(res.statusCode).to.equal(200);
      doneRequest++;
      if(doneRequest === threshold) {
        done();
      }
    });
    http.get('http://localhost:9001/inverted.scss', function(res) {
      expect(/index\.html/.test(res.headers.location)).to.be.true;
      doneRequest++;
      if(doneRequest === threshold) {
        done();
      }
    });
  });

  it('should be able to handle inverted urls 2', function() {
    http.get('http://localhost:9001/test-defined-params/style.css', function(res) {
      expect(res.statusCode).to.equal(200);
    });
  });

  it('should be able to handle redirects', function(done) {
    http.get('http://localhost:9001/test/redirect', function(res) {
      expect(res.statusCode).to.equal(301);
      done();
    });
  });

  it('should be able to handle redirects with specified status code', function(done) {
    http.get('http://localhost:9001/test/redirect-309', function(res) {
      expect(res.statusCode).to.equal(309);
      done();
    });
  });

  it('should be able to handle proxy flags', function(done) {
    http.get('http://localhost:9001/test/proxy', function(res) {
      expect(res.statusCode).to.equal(200);
      expect(res.headers.via).to.be.ok;
      done();
    });
  });

  it('should be able to handle nocase flags', function(done) {
    http.get('http://localhost:9001/test/NOCASE', function(res) {
      expect(res.statusCode).to.equal(200);
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        expect(chunk).to.have.string('it is working');
        done();
      });
    });
  });

  it('should be able to handle forbidden flags', function(done) {
    http.get('http://localhost:9001/test/forbidden', function(res) {
      expect(res.statusCode).to.equal(403);
      done();
    });
  });

  it('should be able to handle gone flags', function(done) {
    http.get('http://localhost:9001/test/gone', function(res) {
      expect(res.statusCode).to.equal(410);
      done();
    });
  });

  it('should be able to handle type flags', function(done) {
    http.get('http://localhost:9001/test/type', function(res) {
      expect(res.headers['content-type']).to.have.string('image/png');
      done();
    });
  });

});
