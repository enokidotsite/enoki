var assert = require('assert')
var path = require('path')
var fs = require('fs')

module.exports = enoki

function enoki (opts) {
  if (!(this instanceof enoki)) return new enoki(opts)
  opts = opts || { }

  assert.equal(typeof opts, 'object', 'opts should be type object')
  assert.equal(typeof opts.directory, 'string', 'opts.directory should be type string')

  this.path = {
    content: path.join(opts.directory, opts.pathContent || 'content'),
    site: path.join(opts.directory, opts.pathSite || 'site')
  }

  try {
    assert(fs.lstatSync(this.path.content).isDirectory(), true, 'missing content')
    assert(fs.lstatSync(this.path.site).isDirectory(), true, 'missing site')
  } catch (err) {
    return
    return console.warn(err.message)
  }

  this.ignore = opts.ignore === undefined ? /(^[.#]|(?:__|~)$)/ : opts.ignore

  this.filetypes = {
    asset: ['.css', '.js'],
    archive: ['.zip'],
    audio: ['.mp3', '.wav', '.aiff'],
    document: ['.pdf'],
    image: ['.jpg', '.jpeg', '.png', '.svg'],
    video: ['.mp4', '.mov']
  }

  // helpers
  this.onPage = opts.onPage || function () { }
  this.onFile = opts.onFile || function () { }

  // kit
  this.getPage = require('./lib/page')
  this.getFile = require('./lib/file')
  this.getSite = require('./lib/site')

  // public
  this.site = this.getSite()
  this.content = this.getPage('/')

  // hacky expose options
  this.site.options = opts

  // public
  return this
}

// output
enoki.prototype.toString = function () {
  return JSON.stringify({
    content: this.content,
    site: this.site
  }, { }, 2)
}
