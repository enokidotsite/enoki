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

  loadContent (parent, file) {
    try {
      var opts = { fs: fs, parent: parent, file: file }
      return hypha.readSiteSync(parent, opts)
    } catch (err) {
      throw new Error(`Content directory "${source}${parent}" is missing`)
    }
  }
}
