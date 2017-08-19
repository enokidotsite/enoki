var path = require('path')
var fs = require('fs')
var xtendMutable = require('xtend/mutable')
var sizeOf = require('image-size')

var utilsContent = require('../utils/content')

module.exports = File

function File (pathFile) {
  var self = this
  var file = { }

  file.dir = dir(pathFile)
  file.filename = filename(pathFile)
  file.extension = extension(pathFile)
  file.name = name(pathFile)
  file.path = pathFile
  file.type = type(file.extension)
  file.url = url(pathFile)

  // extend
  xtendMutable(file, meta())
  xtendMutable(file, dimensions())

  return file

  function type (extension) {
    return Object
      .keys(self.filetypes)
      .reduce(function (result, value, i, source) {
        // pass current result if there is one
        if (result) return result

        // if we match a value, use that
        if (
          self.filetypes[value] &&
          self.filetypes[value].indexOf(extension) >= 0
        ) return value

        // fallback to unknown
        if (i >= source.length) return 'unknown'
      }, '')
  }

  function dir (str) {
    return path.dirname(str)
  }

  function extension (str) {
    return path.extname(str)
  }

  function filename (str) {
    return path.basename(str)
  }

  function meta () {
    // grab meta or fail silently
    try {
      var filenameMeta = pathFile + '.txt'
      var pathMeta = path.join(self.path.content, filenameMeta)
      var isFile = fs.lstatSync(pathMeta).isFile()
      if (isFile) {
        var content = fs.readFileSync(pathMeta, 'utf8')
        file.meta = filenameMeta
        return utilsContent.decode(content)
      } else {
        return { }
      }
    } catch (err) {
      return { }
    }
  }

  function dimensions () {
    // grab dimensions or fail silently
    try {
      var size = sizeOf(path.join(self.path.content, pathFile))
      return {
        ratioX: size.height / size.width,
        ratioY: size.width / size.height,
        height: size.height,
        width: size.width
      }
    } catch (err) {
      return { }
    }
  }

  function name (str) {
    return path.basename(str, extension(str))
  }

  function url (str) {
    return str
  }
}
