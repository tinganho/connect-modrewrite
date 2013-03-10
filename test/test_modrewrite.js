var chai = require( 'chai' ),
    expect = chai.expect,
    http   = require('http')

// Please run `grunt connect` before executing this script

describe('connect-modrewrite', function() {

  it('should response to one level path', function(done) {
    http.get('http://localhost:9001/test', function(res){
      res.setEncoding('utf8');
      res.on('data', function(chunk){
        expect(chunk).to.be.a('string');
        done();
      });
    });
  });

  it('should be able normalize relative paths', function(done) {
    var options = {
      hostname: 'localhost',
      port: 9001,
      path: '/test/style.css',
      method: 'GET',
      headers: {
        'Referer': 'http://localhost:9001/test/2'
      }
    };

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        expect(/#relative-paths-get-normalized/.test(chunk)).to.be.true;
        done();
      });
    });
    req.end();

  });

  it('should be able to recognize Last [L] flag', function(done){

    var doneRequest = 0;
    http.get('http://localhost:9001/test-flag', function(res){
      expect(res.statusCode).to.equal(404);
      doneRequest++;
      if(doneRequest === 2) {
        done();
      }
    });
    http.get('http://localhost:9001/test-flag-2', function(res){
      expect(res.statusCode).to.equal(200);
      doneRequest++;
      if(doneRequest === 2) {
        done();
      }
    });
  });

  it('should be able to handle inverted urls', function(done){
    http.get('http://localhost:9001/style.css', function(res){
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

});
