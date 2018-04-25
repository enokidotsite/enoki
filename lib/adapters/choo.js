var Enoki = require('../read/async')
var Page = require('nanopage')
var xtend = require('xtend')

module.exports = plugin

function plugin (parent, options) {
  options = options || { }
  return function (state, emitter, app) {
    var enoki = new Enoki()

    // content state
    state.site = state.site || { loaded: false, p2p: false }
    state.content = state.content || { }

    // nanopage
    state.page = new Page(state)

    // events
    state.events.CONTENT_LOADED = 'content:loaded'
    state.events.CONTENT_LOAD = 'content:load'

    // listeners
    emitter.on(state.events.DOMCONTENTLOADED, contentLoad)
    emitter.on(state.events.CONTENT_LOAD, contentLoad)

    /**
     * primary method
     */
    async function contentLoad (props) {
      props = props || { }
      // load our site
      await enoki.load(props.url)
      // store our state
      state.content = xtend(state.content, await enoki.readContent())
      state.site = xtend(state.site, await enoki.readSite())
      // good to go
      emitter.emit(state.events.CONTENT_LOADED)
      // render if we should
      if (options.render !== false) emitter.emit(state.events.RENDER)
    }
  }
}
