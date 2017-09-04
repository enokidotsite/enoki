var assert = require('assert')
var fs = require('fs-extra')
var path = require('path')

module.exports = {
  log: log,
  refresh: refresh
}

function log (pathRoot, callback) {
  assert.equal(typeof pathRoot, 'string', 'enoki: pathRoot must be type string')
  var pathFile = path.join(pathRoot, '.log')
  callback = callback || function () { }
  return fs.outputFile(pathFile, '', callback)
}

function refresh (pathRoot, content) {
  assert.equal(typeof pathRoot, 'string', 'enoki: pathRoot must be type string')
  var pathFile = path.join(pathRoot, '.log')
  return fs.appendFileSync(pathFile, content + '\n')
}