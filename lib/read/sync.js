var hypha = require('hypha')

/**
 * NOTE
 * This is all unfinished!
 */

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

  load () {
    var siteConfig = { }
    this.state.content = this.loadContent()
    this.state.site = this.loadSite()
  }

  loadConfig () {

  }

  loadContent (parent, file) {
    try {
      var opts = { fs: fs, parent: parent, file: file }
      return hypha.readSiteSync(parent, opts)
    } catch (err) {
      throw new Error(`Content directory "${source}${parent}" is missing`)
    }
  }

  loadSite (parent, file) {
    return {

    }
  }
}
