var hypha = require('hypha')

var blueprintDefault = require('./blueprint.json')
var defaults = require('./defaults')
var fs = require('fs')

module.exports = class Enoki {
  constructor (props) {
    this.options = xtend(defaults, props)
    this.api =  this.options.api || fs

    this.state = {
      content: { },
      site: {
        info: { },
        config: { },
        loaded: false,
        blueprints: { }
      }
    } 
  }

  load (url) {

  }

  loadContent (archive,parent, file) {
    try {
      var opts = { fs: archive, parent: parent, source: archive.url, file: file }
      var files = await archive.readdir(parent, { recursive: true })
      var glob = files.map(file => path.join(parent, file))
      return hypha.readFilesSync(glob, parent, opts)
    } catch (err) {
      throw new Error(`Content directory "${source}${parent}" is missing`)
    }
  }
}
