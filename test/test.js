
var modRewrite = require('../');



describe('Connect-modrewrite', function() {
  describe('last flag', function() {
    it('should not go to next rewrite rule', function() {
      var middleware = modRewrite(['/a /b [L]', '/a /c']);
      var req = {
        connection { encrypted : false },
        header : function() {}
      };
      middleware();
    });
  });
});
