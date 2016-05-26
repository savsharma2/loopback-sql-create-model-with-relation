var loopback = require('loopback'),
  boot = require('loopback-boot'),
  app = module.exports = loopback(),
  discoverApi = require('./discovery-and-build.js');

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
// discoverApi.discoverAndBuid(app);
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
discoverApi.discoverAndBuid(app).then(function() {
  boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    // discoverApi.discoverAndBuid(app).then(function() {
    if (require.main === module) {
      app.start();
    }
    // });
  });
});
