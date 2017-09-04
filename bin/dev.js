var globify = require('require-globify')
var browserify = require('browserify')
var watchify = require('watchify')
var budo = require('budo')
var path = require('path')
var fs = require('fs')

var utilsOptions = require('../lib/utils/options')
var enoki = require('../transform')

module.exports = serve

function serve (opts) {
  var options = utilsOptions.defaults(opts)
  var paths = utilsOptions.paths(options)

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
