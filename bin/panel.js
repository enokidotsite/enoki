var serverRouter = require('server-router')
var globify = require('require-globify')
var parseBody = require('parse-body')
var Busboy = require('busboy')
var util = require('util')
var fs = require('fs-extra')
var path = require('path')
var budo = require('budo')
var inspect = require('util').inspect

// core
var enokiTransform = require('../transform')
var enoki = require('../')

// utilities
var utilsContent = require('../lib/utils/content')
var utilsOptions = require('../lib/utils/options')
var utilsSite = require('../lib/utils/site')

// write
var writePage = require('../lib/write/file')
var writePage = require('../lib/write/page')
var writeSite = require('../lib/write/site')

module.exports = panel

function panel (opts) {
  var options = utilsOptions.defaults(opts)
  var paths = utilsOptions.paths(options)
  var router = serverRouter()
  
  try {
    // check for panel and log file
    utilsSite.isPanel(paths.panel, paths.root)
    writeSite.log(paths.root)
  } catch (err) {
    return console.log('Panel directory not found')
  }

  // routes
  router.route('POST', '/api/v1/add-files', handleAddFiles)
  router.route('PUT', '/api/v1/remove', handleRemove)
  router.route('PUT', '/api/v1/update', handleUpdate)
  router.route('PUT', '/api/v1/add', handleAdd)
  router.route('GET', '/api/v1/state', handleState)

  // interface
  var server = budo(paths.panel, {
    live: true,
    port: options.portpanel || 8080,
    pushstate: true,
    serve: 'bundle.js',
    dir: [paths.content, path.join(paths.panel, '/assets')],
    browserify: {
      transform: [enokiTransform, globify]
    },
    middleware: function (req, res, next) {
      router.match(req, res)
    }
  }).on('connect', function (ev) {
    console.log('Panel running on %s', ev.uri)
  })

  function handleState(req, res) {
    try {
      var state = enoki({ directory: paths.root })
      res.writeHead(201, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(state))
    } catch (err) {
      handleError(req, res, err)
    }
  }

  function handleUpdate (req, res) {
    parseBody(req, 1e6, function (err, body) {
      if (err) return handleError(req, res, err)
      try {
        writePage.update({
          pathContent: paths.content,
          pathPage: body.pathPage,
          file: body.file,
          page: body.page
        }, function (err) {
          if (err) return handleError(req, res, err)
          if (options.verbose) console.log('updated ' + body.pathPage)
          return handleSuccess(req, res)
        })
      } catch (err) {
        return handleError(req, res, err)
      }
    }) 
  }

  function handleAdd (req, res) {
    parseBody(req, 1e6, function (err, body) {
      if (err) return handleError(req, res, err)
      try {
        writePage.add({
          pathContent: paths.content,
          pathPage: body.pathPage,
          view: body.view,
          title: body.title
        }, function (err) {
          if (err) return handleError(req, res, err)
          if (options.verbose) console.log('created ' + body.pathPage)
          writeSite.refresh(paths.root, body.pathPage)
          return handleSuccess(req, res)
        })
      } catch (err) {
        return handleError(req, res, err)
      }
    }) 
  }

  function handleRemove (req, res) {
    parseBody(req, 1e6, function (err, body) {
      if (err) return handleError(req, res, err)
      try {
        writePage.remove({
          pathContent: paths.content,
          pathPage: body.pathPage
        }, function (err) {
          if (err) return handleError(req, res, err)
          if (options.verbose) console.log('deleted ' + body.pathPage)
          writeSite.refresh(paths.root, body.pathPage)
          return handleSuccess(req, res)
        })
      } catch (err) {
        return handleError(req, res, err)
      }
    }) 
  }

  function handleAddFiles (req, res) {
    if (req.method !== 'POST') {
      return handleError(req, res, { message: 'Can not upload' })
    }
    
    try {
      var busboy = new Busboy({ headers: req.headers })

      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var pathDir = path.join(paths.content, req.headers['path-page'])
        fs.ensureDir(pathDir, function (dir, err) {
          if (err) return handleError(req, res, { message: 'Can not upload' })
          file.pipe(fs.createWriteStream(path.join(pathDir, filename)))
        })
      })

      busboy.on('finish', function() {
        writeSite.refresh(paths.root, req.headers['path-page'])
        res.writeHead(303, { Connection: 'close', Location: '/' });
        res.end();
      });

      req.pipe(busboy)
    } catch (err) {
      if (err) return handleError(req, res, err) 
    }
  }
}

function handleError (req, res, err) {
  res.writeHead(400, { 'Content-Type': 'application/json' })
  return res.end(JSON.stringify({ message: 'Error:' + err.message }))
}

function handleSuccess (req, res) {
  res.writeHead(201, { 'Content-Type': 'application/json' })
  return res.end(JSON.stringify({ message: 'Success' }))
}
