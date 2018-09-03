var nanocontent = require('nanocontent')
var xtend = require('xtend')
var fs = require('fs')

var defaults = require('./defaults')

module.exports = class Enoki {
  constructor (props) {
    this.options = xtend(defaults, props)
    this.api = this.options.api || fs

    this.state = {
      content: { },
      site: {
        info: { },
        config: { },
        loaded: false,
        blueprints: { }
      }
    }

    this.readContent = this.readContent
    this.readSite = this.readSite
  }

  load () {
    var siteConfig = this.loadConfig()

    var contentFile = siteConfig.file || this.options.file
    var contentPath = siteConfig.content || this.options.content

    this.state.content = this.loadContent(contentPath, contentFile)
    this.state.site = this.loadSite(contentPath)
    this.state.site.config = xtend(this.options, siteConfig)
  }

  loadConfig () {
    try {
      var config = fs.readFileSync(this.options.config, 'utf8')
      return JSON.parse(config)
    } catch (err) {
      return { }
    }
  }

  loadContent (parent, file) {
    try {
      var opts = { fs: fs, parent: parent, file: file }
      return nanocontent.readSiteSync(parent, opts)
    } catch (err) {
      throw new Error(`Content directory "${parent}" is missing`)
    }
  }

  loadSite (parent, file) {
    return {

    }
  }

  readContent () {
    if (!this._loaded) this.load()
    return this.state.content
  }

  readSite () {
    if (!this._loaded) this.load()
    return this.state.site
  }
}
