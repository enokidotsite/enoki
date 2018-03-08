var { reservedKeys } = require('hypha/lib/defaults')
var objectKeys = require('object-keys')
var assert = require('assert')
var smarkt = require('smarkt')
var xtend = require('xtend')
var path = require('path')

module.exports = panel

function panel () {
  return async function (state, emitter) {
    var archive

    state.content = { }

    state.site = {
      loaded: false,
      blueprints: { },
      config: { },
      info: { }
    }

    state.enoki = {
      changes: { },
      loading: false
    }

    state.events.ENOKI_FILES_ADD = 'enoki:files:add'
    state.events.ENOKI_SITE_LOAD = 'enoki:site:load'
    state.events.ENOKI_PAGE_ADD = 'enoki:page:add'
    state.events.ENOKI_LOADING = 'enoki:loading'
    state.events.ENOKI_UPDATED = 'enoki:updated'
    state.events.ENOKI_CANCEL = 'enoki:cancel'
    state.events.ENOKI_UPDATE = 'enoki:update'
    state.events.ENOKI_REMOVE = 'enoki:remove'
    state.events.ENOKI_MOVE = 'enoki:move'
    state.events.ENOKI_SAVE = 'enoki:save'
    
    emitter.on(state.events.ENOKI_FILES_ADD, handleFilesAdd)
    emitter.on(state.events.ENOKI_SITE_LOAD, handleSiteLoad)
    emitter.on(state.events.ENOKI_PAGE_ADD, handlePageAdd)
    emitter.on(state.events.ENOKI_LOADING, handleLoading)
    emitter.on(state.events.ENOKI_UPDATE, handleUpdate)
    emitter.on(state.events.ENOKI_CANCEL, handleCancel)
    emitter.on(state.events.ENOKI_REMOVE, handleRemove)
    emitter.on(state.events.ENOKI_SAVE, handleSave)

    function handleUpdate (data) {
      assert.equal(typeof data, 'object', 'enoki: data must be type object')
      assert.equal(typeof data.url, 'string', 'enoki: data.url must be type string')
      assert.equal(typeof data.data, 'object', 'enoki: data.data must be type string')

      // get the changes and merge them
      var changes = state.enoki.changes[data.url]
      state.enoki.changes[data.url] = xtend(changes, data.data)

      // trigger updated and render
      emitter.emit(state.events.ENOKI_UPDATED)
      if (data.render !== false) emitter.emit(state.events.RENDER)
    }

    async function handleSave (data) {
      assert.equal(typeof data, 'object', 'enoki: arg1 must be type object')
      assert.equal(typeof data.path, 'string', 'enoki: arg1.path must be type string')
      assert.equal(typeof data.url, 'string', 'enoki: arg1.url must be type string')
      assert.equal(typeof data.data, 'object', 'enoki: arg1.data must be type object')

      emitter.emit(state.events.ENOKI_LOADING, { loading: true })
      emitter.emit(state.events.RENDER)

      try {
        var contentPage = state.content[data.url]
        var content = xtend(state.content[data.url], data.data)
        var file = data.file || state.site.config.file || 'index.txt'
        var pathFile = path.join(data.path, file)

        // delete reserved keys
        reservedKeys.forEach(key => delete content[key])

        // create the file and save
        await archive.writeFile(pathFile, smarkt.stringify(content))
        await archive.commit()

        // add to state and remove from changes
        state.content[data.url] = xtend(state.content[data.url], state.enoki.changes[data.url])
        delete state.enoki.changes[data.url]

        // refresh and create the content json
        emitter.once(state.events.SITE_REFRESHED, writeContentJson)
        emitter.emit(state.events.SITE_REFRESH)
      } catch (err) {
        alert(err.message)
        console.warn(err)
      }

      emitter.emit(state.events.ENOKI_LOADING, { loading: false })
      emitter.emit(state.events.RENDER)
    }

    function handleCancel (data) {
      assert.equal(typeof data, 'object', 'enoki: data must be type object')
      assert.equal(typeof data.url, 'string', 'enoki: data.url must be type string')

      // discard our changes
      delete state.enoki.changes[data.url]
      emitter.emit(state.events.RENDER)
    }

    function handleLoading (data) {
      if (data && data.loading !== undefined) {
        state.enoki.loading = data.loading
      } else {
        state.enoki.loading = false
      }

      if (data.render !== false) emitter.emit(state.events.RENDER)
    }

    async function handlePageAdd (data) {
      assert.equal(typeof data, 'object', 'enoki: data must be type object')
      assert.equal(typeof data.path, 'string', 'enoki: data.path must be type string')
      assert.equal(typeof data.url, 'string', 'enoki: data.url must be type string')
      assert.equal(typeof data.title, 'string', 'enoki: data.title must be type string')
      assert.equal(typeof data.view, 'string', 'enoki: data.view must be type string')

      emitter.emit(state.events.ENOKI_LOADING, { loading: true })

      try {
        var content = { title: data.title, view: data.view }
        var file = data.file || state.site.config.file
        var pathFile = path.join(data.path, file)

        // create the directory and file
        await archive.mkdir(data.path)
        await archive.writeFile(pathFile, smarkt.stringify(content))
        emitter.emit(state.events.SITE_REFRESH)
      } catch (err) {
        alert(err.message)
        console.warn(err)
      }

      emitter.emit(state.events.ENOKI_LOADING, { loading: false, render: false })
      if (data.redirect !== false) emitter.emit(state.events.REPLACESTATE, '?url=' + data.url)
    }

    async function handleRemove (data) {
      assert.equal(typeof data, 'object', 'enoki: data must be type object')
      assert.equal(typeof data.url, 'string', 'enoki: data.url must be type string')
      assert.equal(typeof data.path, 'string', 'enoki: data.path must be type string')

      if (data.confirm) {
        if (!window.confirm(`Are you sure you want to delete ${data.title || data.path}?`)) return
      }

      emitter.emit(state.events.ENOKI_LOADING, { loading: true })

      try {
        var isFile = path.extname(data.path)
        if (isFile) {
          await archive.unlink(data.path)
          try { await archive.unlink(data.path + '.txt') } catch (err) { }
        } else {
          await archive.rmdir(data.path, { recursive: true })
        }

        emitter.emit(state.events.SITE_REFRESH)

        if (data.redirect !== false) {
          emitter.emit(
            state.events.REPLACESTATE,
            '?url=' + path.join(data.url, '../').replace(/\/$/, '')
          )
        }
      } catch (err) {
        alert(err.message)
        console.warn(err)
      }

      emitter.emit(state.events.ENOKI_LOADING, { loading: false })
    }

    async function handleFilesAdd (data) {
      assert.equal(typeof data, 'object', 'enoki: data must be type object')
      assert.equal(typeof data.url, 'string', 'enoki: data.url must be type string')
      assert.equal(typeof data.path, 'string', 'enoki: data.path must be type string')
      assert.equal(typeof data.files, 'object', 'enoki: data.files must be type object')

      emitter.emit(state.events.ENOKI_LOADING, { loading: true })
      await Promise.all(objectKeys(data.files).map(saveFile))
      emitter.emit(state.events.ENOKI_LOADING, { loading: false })

      async function saveFile (key) {
        try {
          var file = data.files[key]
          var filePath = path.join(data.path, file.name)
          var fileEncoded = await getBase64(file)
          var encoder = typeof fileEncoded === 'string' ? 'base64' : 'binary'
          return archive.writeFile(filePath, fileEncoded, encoder)
        } catch (err) {
          alert(err.message)
          console.warn(err)
        }
      }
    }

    function handleSiteLoad (data) {
      if (data.content) state.content = data.content
      if (data.site) state.site = data.site
      if (data.archive) archive = data.archive
      if (data.render !== false) emitter.emit(state.events.RENDER)
    }

    async function writeContentJson () {
      try { await archive.readdir('/bundles') }
      catch (err) { await archive.mkdir('/bundles') }

      try {
        await archive.writeFile(
          '/bundles/content.json',
          JSON.stringify(state.content, { }, 2)
        )
        await archive.commit()
      } catch (err) {
        console.warn(err)
      }
    }
  }
}

function getBase64 (file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function () {
      resolve(reader.result.split(',')[1])
    }
    reader.onerror = function (error) {
      reject(error)
    }
  })
}
