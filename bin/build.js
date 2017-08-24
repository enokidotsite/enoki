var fsCompareSync = require('fs-compare').sync
var assert = require('assert')
var path = require('path')
var fs = require('fs-extra')

var utilsOptions = require('../lib/utils/options')

module.exports = build

function build (opts) {
  var options = utilsOptions.defaults(opts)
  var paths = utilsOptions.paths(options)
  var site = readSiteSync()
  var view = readViewSync()

  assert.equal(typeof site, 'object', 'site must be type object')
  assert.equal(typeof site.state, 'object', 'site.state must be type object')

  // sync build
  route(site.state.content)
  copyAssets()
  if (options.verbose) console.log('build finished!')

  // create route
  function route (page) {
    assert.equal(typeof page, 'object', 'page must be type object')
    writeIndex()

    if (typeof page.files === 'object') copyFiles()
    if (typeof page.children === 'object') startChildren()

    // create an index file
    function writeIndex () {
      assert.equal(typeof page.path, 'string', 'page path must be type string')
      fs.outputFile(
        path.join(paths.output, page.path, 'index.html'),
        formatView(site.toString(page.path, site.state)),
        { encoding: 'utf-8' },
        function (err, data) {
          if (err) return console.error(err.message)
          if (options.verbose) console.log('created ' + page.path)
        }
      )
    }

    // copy over static assets
    function copyFiles () {
      Object.values(page.files).forEach(copyFile)
    }

    function copyFile (file) {
      var pathFileContent = path.join(paths.content, file.path)
      var pathFileBuild = path.join(paths.output, file.path)
      if (!file.path) return

      // if index exists
      try {
        var exists = fs.lstatSync(pathFileBuild).isFile()
        var diff = fsCompareSync(modifiedTime, pathFileContent, pathFileBuild)
        if (diff >= 1) copy()

        function modifiedTime (fileName, cb) {
          return fs.statSync(fileName).mtime
        }

      // if it does not
      } catch (err) {
        copy()
      }

      function copy () {
        fs.copy(
          pathFileContent,
          pathFileBuild,
          function (err) {
            if (err) return console.error(err.message)
            if (options.verbose) console.log('copied file ' + file.path)
          }
        )
      }
    }

    // loop through children 
    function startChildren () {
      Object.values(page.children).forEach(function (child) {
        if (child.children) route(child)
      })
    }
  }

  // copy assets
  function copyAssets () {
    try {
      fs.readdirSync(paths.assets).forEach(function (file) {
        if (file === 'index.html') return
        fs.copy(
          path.join(paths.assets, file),
          path.join(paths.output, file),
          function (err) {
            if (err) return console.error(err.message)
            if (options.verbose) console.log('copied file ' + file.path)
          }
        )
      })
    // fail silently
    } catch (err) { }
  }

  // throw the content in the view
  function formatView (input) {
    return view.replace('<main></main>', input)
  }

  // try reading the site’s exports
  function readSiteSync () {
    try {
      var exists = fs.lstatSync(path.join(paths.site, 'index.js')).isFile()
      var site = require(paths.site)
    } catch (err) {
      throw new Error(`enoki: site does not exist in directory "${options.site}"`)
    }

    assert.equal(typeof site.toString, 'function', 'enoki: site must export `.toString()` to render routes')
    return site
  }

  // load the view if it’s there, default if not
  function readViewSync () {
    try {
      return fs.readFileSync(path.join(paths.assets, 'index.html'), 'utf8')
    } catch (err) {
      return '<!DOCTYPE html><html><head></head><body><main></main><script src="/bundle.js"></script></body></html>'
    }
  }
}
