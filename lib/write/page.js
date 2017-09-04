var assert = require('assert')
var fs = require('fs-extra')
var path = require('path')

var utilsContent = require('../utils/content')

module.exports = {
  add: add,
  update: update,
  remove: remove
}

function add (opts, callback) {
  assert.equal(typeof opts, 'object', 'enoki: update opts must be object')
  assert.equal(typeof opts.pathContent, 'string', 'enoki: update opts.pathContent must be string')
  assert.equal(typeof opts.pathPage, 'string', 'enoki: update opts.pathPage must be string')
  assert.equal(typeof opts.view, 'string', 'enoki: update opts.view must be string')
  assert.equal(typeof opts.title, 'string', 'enoki: update opts.title must be string')

  var filename = opts.view + '.txt' 
  var pathOutput = path.join(opts.pathContent, opts.pathPage, filename)
  var fileContent = utilsContent.encode({ title: opts.title })
  callback = callback || function () { }

  return fs.outputFile(pathOutput, fileContent, callback)
}

function update (opts, callback) {
  assert.equal(typeof opts, 'object', 'enoki: update opts must be object')
  assert.equal(typeof opts.pathContent, 'string', 'enoki: update opts.pathContent must be string')
  assert.equal(typeof opts.pathPage, 'string', 'enoki: update opts.pathPage must be string')
  assert.equal(typeof opts.file, 'string', 'enoki: update opts.file must be string')
  assert.equal(typeof opts.page, 'object', 'enoki: update opts.page must be object')

  var pathOutput = path.join(opts.pathContent, opts.pathPage, opts.file)
  var fileContent = utilsContent.encode(opts.page)
  callback = callback || function () { }

  return fs.outputFile(pathOutput, fileContent, callback)
}

function remove (opts, callback) {
  assert.equal(typeof opts, 'object', 'enoki: update opts must be object')
  assert.equal(typeof opts.pathContent, 'string', 'enoki: update opts.pathContent must be string')
  assert.equal(typeof opts.pathPage, 'string', 'enoki: update opts.pathPage must be string')

  var pathOutput = path.join(opts.pathContent, opts.pathPage)
  callback = callback || function () { }

  return fs.remove(pathOutput, callback)
}



