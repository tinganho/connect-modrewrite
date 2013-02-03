var chai = require( 'chai' ),
    expect = chai.expect,
    http   = require('http')

// Please run `grunt connect` before executing this script

describe('grunt-contrib-connect-modrewrite', function() {

  describe('Modrewrite', function() {

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

    it('should be able to recognize Last [L] flag', function(){
      http.get('http://localhost:9001/test/2/1', function(res){
        res.setEncoding('utf8');
        res.on('data', function(chunk){
          expect(chunk).to.be.a('string');
          done();
        });
      });
      http.get('http://localhost:9001/test/2/1', function(res){
        res.setEncoding('utf8');
        res.on('data', function(chunk){
          expect(/flag-is-working/.test(chunk)).to.be.true;
          done();
        });
      });
    })

  });
});
