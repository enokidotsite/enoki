var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')

module.exports = Site

function Site () {
  var self = this

  return {
    blueprints: readDir('blueprints'),
    components: readDir('components'),
    fields: readDir('fields'),
    plugins: readDir('plugins'),
    views: readDir('views')
  }

  function readDir (pathDir) {
    var pathRoot = path.join(self.path.site, pathDir)
    try {
      return fs.readdirSync(pathRoot)
        .filter(file => !file.match(self.ignore))
        .reduce(function (result, file) {
          var ext = path.extname(file)
          var name = path.basename(file, ext)
          var pathFileRoot = path.join(pathRoot, file)

          // read yaml
          if (ext === '.yml') {
            result[name] = yaml.safeLoad(fs.readFileSync(pathFileRoot, 'utf8'))
            self.onFile(pathFileRoot)
          }

          if (ext === '.js') {
            result[name] = './' + path.join('site', pathDir, name)
          }

          return result
        }, { })
    } catch (err) {
      return { }
    }
  }
}
