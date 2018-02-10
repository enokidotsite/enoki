var Enoki = require('./lib')

module.exports = plugin

function plugin (parent, options) {
  options = options || { }
  return function (state, emitter, app) {
    var enoki = new Enoki()

    state.site = { loaded: false, p2p: false }
    state.content = { }
    state.media = { }

    state.events.CONTENT_LOADED = 'content:loaded'
    state.events.CONTENT_LOAD = 'content:load'

    emitter.on(state.events.DOMCONTENTLOADED, contentLoad)
    emitter.on(state.events.CONTENT_LOAD, contentLoad)

    async function contentLoad (props) {
      props = props || { }
      await enoki.load(props.url)
      state.content = await enoki.readContent()
      state.site = await enoki.readSite()
      emitter.emit(state.events.CONTENT_LOADED)
      if (options.render !== false) emitter.emit(state.events.RENDER)
    }
  }
}