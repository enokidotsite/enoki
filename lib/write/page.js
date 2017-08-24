var assert = require('assert')
var fs = require('fs-extra')
var path = require('path')

var utilsContent = require('../utils/content')

module.exports = {
  update: update,
  remove: remove
}

function update (opts, callback) {
  assert.equal(typeof opts, 'object', 'enoki: update opts must be object')
  assert.equal(typeof opts.pathContent, 'string', 'enoki: update opts.pathContent must be string')
  assert.equal(typeof opts.pathPage, 'string', 'enoki: update opts.path must be string')
  assert.equal(typeof opts.file, 'string', 'enoki: update opts.file must be string')
  assert.equal(typeof opts.page, 'object', 'enoki: update opts.page must be object')

  var pathOutput = path.join(opts.pathContent, opts.pathPage, opts.file)
  var fileContent = utilsContent.encode(opts.page)
  callback = callback || function () { }

  return fs.outputFile(pathOutput, fileContent, callback)
}

function remove () {

}




