var fs = require('fs-extra')
var assert = require('assert')

module.exports = {
  isPanel: isPanel
}

function isPanel (pathPanel, pathRoot) {
  assert.equal(typeof pathPanel, 'string', 'enoki: pathPanel must be type string')
  assert.equal(typeof pathRoot, 'string', 'enoki: pathRoot must be type string')
  return fs.lstatSync(pathPanel).isDirectory()
}
