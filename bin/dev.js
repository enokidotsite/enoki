var fs = require('fs')
var path = require('path')
var browserify = require('browserify')
var watchify = require('watchify')
var budo = require('budo')
var globify = require('require-globify')

var enoki = require('../transform')
var getOptions = require('./options')

module.exports = serve

function serve (opts) {
  var options = getOptions.defaults(opts)
  var paths = getOptions.paths(options)

  budo(paths.site, {
    live: options.live,
    port: options.port,
    pushstate: true,
    serve: 'bundle.js',
    dir: [paths.content, paths.assets],
    browserify: {
      transform: [enoki, globify]
    }
  }).on('connect', function (ev) {
    console.log('Server running on %s', ev.uri)
    // console.log('LiveReload running on port %s', ev.livePort)
  }).on('update', function (buffer) {
    console.log('bundle - %d bytes', buffer.length)
  })
}
