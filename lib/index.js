var parseDatUrl = require('parse-dat-url')
var assert = require('assert')
var hypha = require('hypha')
var xtend = require('xtend')
var path = require('path')
var xhr = require('xhr')

var blueprintDefault = require('./blueprint.json')
var defaults = require('./defaults')

module.exports = class Enoki {
  constructor (props) {
    this.options = xtend(defaults, props)
    this.api = typeof DatArchive !== 'undefined'
      ? this.options.api || DatArchive
      : this.options.api

    // props
    this._loaded = false
    this._p2p = typeof this.options !== 'undefined'

    // archives
    this.archives = {
      content: { },
      site: { }
    }

    // state
    this.state = {
      content: { },
      config: { },
      info: { },
      site: {
        blueprints: { },
        loaded: false
      }
    }

    // public
    this.readContent = this.readContent
    this.readSite = this.readSite
  }
  
  async load (url) {
    // load dat or http
    url = url || window.location.toString()
    if (this.isDatUrl(url)) await this.loadDat(url)
    else await this.loadHttp(url)
  }

  async loadDat (url) {
    var siteArchive = new this.api(url)
    var siteConfig = await this.loadDatConfig(siteArchive)
    var siteInfo = await this.loadDatInfo(siteArchive)

    // remote or local content
    if (siteConfig.content && this.isDatUrl(siteConfig.content)) {
      var contentUrl = parseDatUrl(siteConfig.content)
      var contentArchive = new this.api(contentUrl.origin)
      var contentConfig = await this.loadDatConfig(contentArchive)
      var contentInfo = await this.loadDatInfo(contentArchive)
      contentConfig.content = contentConfig.content || contentUrl.pathname
    } else {
      var contentArchive = siteArchive
      var contentConfig = siteConfig
    }

    // remote or local config
    var blueprintsPath = contentConfig.blueprints || this.options.blueprints
    var contentFile = contentConfig.file || this.options.file
    var contentPath = contentConfig.content || this.options.content

    // update globals
    this.state.content = await this.loadDatContent(contentArchive, contentPath, contentFile)
    this.state.site = await this.loadDatSite(siteArchive, blueprintsPath)
    this.state.site.config = xtend(this.options, siteConfig)
    this.state.site.info = siteInfo
    this.archives.content = contentArchive
    this.archives.site = siteArchive
    this._loaded = true
  }

  async loadDatSite (archive, blueprintsPath) {
    var blueprints = await this.loadDatBlueprints(archive, blueprintsPath)
    return {
      blueprints: blueprints,
      loaded: true,
      p2p: true
    }
  }

  async loadDatContent (archive, parent, file) {
    try {
      var opts = { fs: archive, parent: parent, source: archive.url, file: file }
      var files = await archive.readdir(parent, { recursive: true })
      var glob = files.map(file => path.join(parent, file))
      return hypha.readFiles(glob, parent, opts)
    } catch (err) {
      throw new Error(`Content directory "${source}${parent}" is missing`)
    }
  }

  async loadDatConfig (archive) {
    try {
      var config = await archive.readFile(this.options.config)
      return JSON.parse(config)
    } catch (err) {
      return { }
    }
  }

  async loadDatBlueprints (archive, parent) {
    try {
      var files = await archive.readdir(parent)
      var output = { }
      await Promise.all(files.map(read))
      if (!output.default) output.default = blueprintDefault
      return output

      async function read (blueprintPath) {
        var ext = path.extname(blueprintPath)
        if (ext === '.json') {
          var data = await archive.readFile(path.join(parent, blueprintPath))
          output[path.basename(blueprintPath, ext)] = JSON.parse(data)
          return data
        }
      }
    } catch (err) {
      return {
        default: blueprintDefault
      }
    }
  }

  async loadDatInfo (archive) {
    try {
      return archive.getInfo()
    } catch (err) {
      return { }
    }
  }

  async loadHttp (url) {
    var self = this
    return new Promise(function (resolve, reject) {
      var bust = Math.floor(Date.now() / 1000)
      xhr('/bundles/content.json?' + bust, function (err, resp) {
        self.state.site.loaded = true
        try {
          self.state.content = JSON.parse(resp.body)
          resolve()
        } catch (err) {
          reject(err)
        }
        self._loaded = true
      })
    })
  }

  getArchives () {
    return this.archives
  }

  getContentArchive () {
    return this.archives.content
  }

  getSiteArchive () {
    return this.archives.site
  }

  async readContent (props) {
    if (!this._loaded) await this.load()
    return this.state.content
  }

  async readSite (props) {
    if (!this._loaded) await this.load()
    return this.state.site
  }

  isDatUrl (url) {
    return url.indexOf('dat://') >= 0
  }
}
