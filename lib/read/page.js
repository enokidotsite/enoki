var path = require('path')
var fs = require('fs')
var slash = require('slash')
var xtendMutable = require('xtend/mutable')

var utilsContent = require('../utils/content')

module.exports = Page

function Page (pathDir) {
  var self = this
  var page = { }
  var pathRoot = path.join(self.path.content, pathDir)
  var dirname = path.basename(pathDir)

  // public
  page.path = slash(pathDir)
  page.url = slash(pathDir + '/')
  page.dirname = dirname
  page.files = { }
  page.view = { }
  page.children = { }

  // construct
  var dir = { }

  try {
    var dir = fs.readdirSync(pathRoot)
  } catch (err) {
    console.warn('No directory: ' + pathDir)
  }

  // build
  dir
    .filter(file => !file.match(self.ignore))
    .forEach(readFile)

  return page

  function readFile (file) {
    // meta
    var ext = path.extname(file)
    var name = path.basename(file, ext)
    var pathFile = path.join(pathDir, file)
    var pathFileRoot = path.join(pathRoot, file)
    var isDir = fs.lstatSync(pathFileRoot).isDirectory()

    // directory
    if (isDir) {
      var child = self.getPage(pathFile)
      page.children[name] = child
      self.onPage(pathFileRoot)
    // file
    } else {
      // has blueprint
      if (self.site && hasViewOrBlueprint() && ext === '.txt') {
        var content = fs.readFileSync(pathFileRoot, 'utf8')
        var parsed = utilsContent.decode(content)
        page.view = name
        page.file = file
        xtendMutable(page, parsed)
      // is file and not text
      } else {
        if (ext !== '.txt') {
          page.files[file] = self.getFile(pathFile)
        }
      }
      self.onFile(pathFileRoot)
    }

    function hasViewOrBlueprint () {
      return typeof self.site.blueprints[name] !== 'undefined' || 
        typeof self.site.views[name] !== 'undefined'
    }
  }
}
